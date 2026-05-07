"""
Integration tests — spin up a local HTTP server and verify actual payloads.

Unlike unit tests (which mock _post), these tests exercise the full stack:
  init() → patch → trace/span → flush → real HTTP POST → payload verified

Run with: pytest sdk/python/tests/test_integration.py -v
"""
import sys, os, time, json, threading
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from http.server import HTTPServer, BaseHTTPRequestHandler
from unittest.mock import MagicMock, patch
import vantra


# ── Local HTTP server ─────────────────────────────────────────────────────────

class _Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length)
        self.server.received.append({
            'path': self.path,
            'auth': self.headers.get('Authorization', ''),
            'body': json.loads(body) if body else None,
        })
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b'{"ok":true}')

    def log_message(self, *_):
        pass  # silence server output during tests


def _start_server():
    server = HTTPServer(('127.0.0.1', 0), _Handler)
    server.received = []
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server


def _reset(server, api_key='van_test_key', endpoint=None):
    """Re-init vantra pointing at the local server."""
    server.received.clear()
    port = server.server_address[1]
    os.environ['VANTRA_ENDPOINT'] = endpoint or f'http://127.0.0.1:{port}'
    import importlib
    importlib.reload(vantra)
    # init() starts the flush worker thread and picks up VANTRA_ENDPOINT
    vantra.init(
        api_key=api_key,
        project='integration-test',
        patch_openai=False,
        patch_anthropic=False,
    )


@pytest.fixture(scope='module')
def server():
    s = _start_server()
    yield s
    s.shutdown()


def _wait_for(server, path, timeout=3.0):
    """Poll until server receives a request at the given path."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        if any(r['path'] == path for r in server.received):
            return True
        time.sleep(0.05)
    return False


# ── Payload schema tests ──────────────────────────────────────────────────────

class TestHttpPayloads:
    def setup_method(self, method):
        self.server = _start_server()
        _reset(self.server)

    def teardown_method(self, method):
        self.server.shutdown()

    def test_trace_post_hits_correct_path(self):
        @vantra.trace
        def fn(): pass
        fn()
        assert _wait_for(self.server, '/traces'), "No POST to /traces received"

    def test_trace_post_has_auth_header(self):
        @vantra.trace
        def fn(): pass
        fn()
        _wait_for(self.server, '/traces')
        req = next(r for r in self.server.received if r['path'] == '/traces')
        assert req['auth'] == 'Bearer van_test_key'

    def test_trace_payload_schema(self):
        @vantra.trace(name='integration_run')
        def fn(): pass
        fn()
        _wait_for(self.server, '/traces')
        req = next(r for r in self.server.received if r['path'] == '/traces')
        body = req['body']
        assert body['name'] == 'integration_run'
        assert body['project'] == 'integration-test'
        assert body['status'] == 'ok'
        assert 'trace_id' in body
        assert 'start_time' in body
        assert 'end_time' in body
        assert body['duration_ms'] >= 0
        assert body['total_tokens'] == 0
        assert body['total_cost_usd'] == 0.0

    def test_trace_error_payload(self):
        @vantra.trace
        def fn(): raise ValueError('integration error')
        with pytest.raises(ValueError):
            fn()
        _wait_for(self.server, '/traces')
        req = next(r for r in self.server.received if r['path'] == '/traces')
        assert req['body']['status'] == 'error'
        assert req['body']['error_message'] == 'integration error'

    def test_spans_posted_after_trace(self):
        @vantra.trace
        def fn():
            with vantra.span('step_one', kind='retrieval'): pass
            with vantra.span('step_two', kind='llm'): pass
        fn()
        _wait_for(self.server, '/spans')
        span_req = next(r for r in self.server.received if r['path'] == '/spans')
        spans = span_req['body']
        assert len(spans) == 2
        names = {s['name'] for s in spans}
        assert names == {'step_one', 'step_two'}

    def test_span_payload_schema(self):
        @vantra.trace
        def fn():
            with vantra.span('my_span', kind='chain'): pass
        fn()
        _wait_for(self.server, '/spans')
        span_req = next(r for r in self.server.received if r['path'] == '/spans')
        s = span_req['body'][0]
        assert 'span_id' in s
        assert 'trace_id' in s
        assert s['name'] == 'my_span'
        assert s['kind'] == 'chain'
        assert s['status'] == 'ok'
        assert 'start_time' in s
        assert 'end_time' in s
        assert s['duration_ms'] >= 0

    def test_span_trace_id_matches_trace(self):
        @vantra.trace
        def fn():
            with vantra.span('s'): pass
        fn()
        _wait_for(self.server, '/spans')
        trace_req = next(r for r in self.server.received if r['path'] == '/traces')
        span_req = next(r for r in self.server.received if r['path'] == '/spans')
        assert span_req['body'][0]['trace_id'] == trace_req['body']['trace_id']

    def test_set_output_in_payload(self):
        @vantra.trace
        def fn():
            with vantra.span('s') as sp:
                sp.set_output({'answer': 'Paris'})
        fn()
        _wait_for(self.server, '/spans')
        span = next(r for r in self.server.received if r['path'] == '/spans')['body'][0]
        assert span['output'] == {'answer': 'Paris'}

    def test_set_input_in_payload(self):
        @vantra.trace
        def fn():
            with vantra.span('s') as sp:
                sp.set_input({'query': 'capital of France'})
        fn()
        _wait_for(self.server, '/spans')
        span = next(r for r in self.server.received if r['path'] == '/spans')['body'][0]
        assert span['input'] == {'query': 'capital of France'}

    def test_capture_io_false_omits_input_output(self):
        vantra._config['capture_io'] = False
        @vantra.trace
        def fn():
            with vantra.span('s') as sp:
                sp.set_input({'secret': 'hidden'})
                sp.set_output({'result': 'hidden'})
        fn()
        _wait_for(self.server, '/spans')
        span = next(r for r in self.server.received if r['path'] == '/spans')['body'][0]
        assert 'input' not in span or span.get('input') is None
        assert 'output' not in span or span.get('output') is None
        vantra._config['capture_io'] = True

    def test_prompt_version_in_trace_payload(self):
        @vantra.trace(name='versioned', prompt_version='v2')
        def fn(): pass
        fn()
        _wait_for(self.server, '/traces')
        body = next(r for r in self.server.received if r['path'] == '/traces')['body']
        assert body.get('prompt_version') == 'v2'

    def test_prompt_version_absent_when_not_set(self):
        @vantra.trace(name='unversioned')
        def fn(): pass
        fn()
        _wait_for(self.server, '/traces')
        body = next(r for r in self.server.received if r['path'] == '/traces')['body']
        assert 'prompt_version' not in body or body.get('prompt_version') is None

    def test_total_tokens_summed_in_trace(self):
        @vantra.trace
        def fn():
            with vantra.span('s') as sp:
                sp.set_tokens(100, 50)
        fn()
        _wait_for(self.server, '/traces')
        body = next(r for r in self.server.received if r['path'] == '/traces')['body']
        assert body['total_tokens'] == 150

    def test_no_spans_means_no_spans_post(self):
        @vantra.trace
        def fn(): pass
        fn()
        _wait_for(self.server, '/traces')
        time.sleep(0.2)
        assert not any(r['path'] == '/spans' for r in self.server.received)

    def test_disabled_sends_nothing(self):
        vantra._config['enabled'] = False
        @vantra.trace
        def fn(): return 42
        result = fn()
        time.sleep(0.2)
        assert result == 42
        assert len(self.server.received) == 0
        vantra._config['enabled'] = True


# ── Flush worker tests ────────────────────────────────────────────────────────

class TestFlushWorker:
    """Spans outside a trace go to the queue and are flushed by the background worker."""

    def setup_method(self, method):
        self.server = _start_server()
        _reset(self.server)

    def teardown_method(self, method):
        self.server.shutdown()

    def test_orphan_span_flushed_to_spans_endpoint(self):
        with vantra.span('orphan'): pass
        assert _wait_for(self.server, '/spans', timeout=3.0), "Orphan span was not flushed"

    def test_orphan_span_payload_schema(self):
        with vantra.span('queued_span', kind='tool'): pass
        _wait_for(self.server, '/spans')
        req = next(r for r in self.server.received if r['path'] == '/spans')
        span = req['body'][0]
        assert span['name'] == 'queued_span'
        assert span['kind'] == 'tool'
        assert span['trace_id'] is None  # no parent trace

    def test_multiple_orphans_batched(self):
        with vantra.span('a'): pass
        with vantra.span('b'): pass
        _wait_for(self.server, '/spans')
        time.sleep(vantra._flush_interval + 0.2)
        all_spans = []
        for r in self.server.received:
            if r['path'] == '/spans':
                all_spans.extend(r['body'])
        names = {s['name'] for s in all_spans}
        assert 'a' in names
        assert 'b' in names


# ── Async trace HTTP tests ────────────────────────────────────────────────────

class TestAsyncHttpPayloads:
    def setup_method(self, method):
        self.server = _start_server()
        _reset(self.server)

    def teardown_method(self, method):
        self.server.shutdown()

    def test_async_trace_posts_to_traces(self):
        import asyncio

        async def go():
            @vantra.trace(name='async_integration')
            async def fn(): pass
            await fn()

        asyncio.run(go())
        assert _wait_for(self.server, '/traces'), "No POST to /traces from async trace"
        body = next(r for r in self.server.received if r['path'] == '/traces')['body']
        assert body['name'] == 'async_integration'
        assert body['status'] == 'ok'

    def test_async_trace_spans_posted(self):
        import asyncio

        async def go():
            @vantra.trace
            async def fn():
                with vantra.span('async_span'): pass
            await fn()

        asyncio.run(go())
        _wait_for(self.server, '/spans')
        req = next(r for r in self.server.received if r['path'] == '/spans')
        assert req['body'][0]['name'] == 'async_span'

    def test_async_trace_error_payload(self):
        import asyncio

        async def go():
            @vantra.trace
            async def fn(): raise RuntimeError('async fail')
            with pytest.raises(RuntimeError):
                await fn()

        asyncio.run(go())
        _wait_for(self.server, '/traces')
        body = next(r for r in self.server.received if r['path'] == '/traces')['body']
        assert body['status'] == 'error'
        assert body['error_message'] == 'async fail'


# ── OpenAI patch HTTP tests ───────────────────────────────────────────────────

class TestOpenAIHttpPayloads:
    def setup_method(self, method):
        self.server = _start_server()
        _reset(self.server)

    def teardown_method(self, method):
        self.server.shutdown()

    def _make_response(self, input_tokens=21, output_tokens=29, content='Paris'):
        r = MagicMock()
        r.usage.prompt_tokens = input_tokens
        r.usage.completion_tokens = output_tokens
        r.choices[0].message.content = content
        return r

    def test_openai_span_posted_with_tokens(self):
        try:
            from openai.resources.chat.completions import Completions
            from vantra.integrations import openai as oai_integration

            response = self._make_response()
            with patch.object(Completions, 'create', return_value=response):
                oai_integration.patch()

                @vantra.trace
                def fn():
                    Completions.create(MagicMock(), model='gpt-4o-mini',
                                       messages=[{'role': 'user', 'content': 'hi'}])
                fn()

            _wait_for(self.server, '/spans')
            spans = next(r for r in self.server.received if r['path'] == '/spans')['body']
            llm = next(s for s in spans if s.get('kind') == 'llm')
            assert llm['provider'] == 'openai'
            assert llm['model'] == 'gpt-4o-mini'
            assert llm['input_tokens'] == 21
            assert llm['output_tokens'] == 29
            assert llm['cost_usd'] > 0
        except ImportError:
            pytest.skip('openai not installed')

    def test_openai_span_has_input_messages(self):
        try:
            from openai.resources.chat.completions import Completions
            from vantra.integrations import openai as oai_integration

            messages = [
                {'role': 'system', 'content': 'Be helpful.'},
                {'role': 'user', 'content': 'What is Paris?'},
            ]
            with patch.object(Completions, 'create', return_value=self._make_response()):
                oai_integration.patch()

                @vantra.trace
                def fn():
                    Completions.create(MagicMock(), model='gpt-4o-mini', messages=messages)
                fn()

            _wait_for(self.server, '/spans')
            spans = next(r for r in self.server.received if r['path'] == '/spans')['body']
            llm = next(s for s in spans if s.get('kind') == 'llm')
            assert len(llm['input']['messages']) == 2
        except ImportError:
            pytest.skip('openai not installed')

    def test_openai_capture_io_false_no_input_output_in_payload(self):
        try:
            from openai.resources.chat.completions import Completions
            from vantra.integrations import openai as oai_integration

            vantra._config['capture_io'] = False
            with patch.object(Completions, 'create', return_value=self._make_response()):
                oai_integration.patch()

                @vantra.trace
                def fn():
                    Completions.create(MagicMock(), model='gpt-4o-mini',
                                       messages=[{'role': 'user', 'content': 'secret'}])
                fn()

            _wait_for(self.server, '/spans')
            spans = next(r for r in self.server.received if r['path'] == '/spans')['body']
            llm = next(s for s in spans if s.get('kind') == 'llm')
            assert llm.get('input') is None
            assert llm.get('output') is None
            assert llm['input_tokens'] == 21  # tokens still tracked
            vantra._config['capture_io'] = True
        except ImportError:
            pytest.skip('openai not installed')


# ── Anthropic patch HTTP tests ────────────────────────────────────────────────

class TestAnthropicHttpPayloads:
    def setup_method(self, method):
        self.server = _start_server()
        _reset(self.server)

    def teardown_method(self, method):
        self.server.shutdown()

    def _make_response(self, input_tokens=15, output_tokens=25, text='Hello!'):
        r = MagicMock()
        r.usage.input_tokens = input_tokens
        r.usage.output_tokens = output_tokens
        r.content = [MagicMock(text=text)]
        return r

    def test_anthropic_span_posted_with_tokens(self):
        try:
            from anthropic.resources.messages.messages import Messages
            from vantra.integrations import anthropic as ant_integration

            with patch.object(Messages, 'create', return_value=self._make_response()):
                ant_integration.patch()

                @vantra.trace
                def fn():
                    Messages.create(MagicMock(), model='claude-haiku-4-5',
                                    messages=[{'role': 'user', 'content': 'hi'}])
                fn()

            _wait_for(self.server, '/spans')
            spans = next(r for r in self.server.received if r['path'] == '/spans')['body']
            llm = next(s for s in spans if s.get('kind') == 'llm')
            assert llm['provider'] == 'anthropic'
            assert llm['model'] == 'claude-haiku-4-5'
            assert llm['input_tokens'] == 15
            assert llm['output_tokens'] == 25
            assert llm['cost_usd'] > 0
        except ImportError:
            pytest.skip('anthropic not installed')

    def test_anthropic_span_has_full_messages(self):
        try:
            from anthropic.resources.messages.messages import Messages
            from vantra.integrations import anthropic as ant_integration

            messages = [
                {'role': 'user', 'content': 'first'},
                {'role': 'assistant', 'content': 'reply'},
                {'role': 'user', 'content': 'follow up'},
            ]
            with patch.object(Messages, 'create', return_value=self._make_response()):
                ant_integration.patch()

                @vantra.trace
                def fn():
                    Messages.create(MagicMock(), model='claude-haiku-4-5', messages=messages)
                fn()

            _wait_for(self.server, '/spans')
            spans = next(r for r in self.server.received if r['path'] == '/spans')['body']
            llm = next(s for s in spans if s.get('kind') == 'llm')
            assert len(llm['input']['messages']) == 3
        except ImportError:
            pytest.skip('anthropic not installed')

    def test_anthropic_capture_io_false_no_input_output(self):
        try:
            from anthropic.resources.messages.messages import Messages
            from vantra.integrations import anthropic as ant_integration

            vantra._config['capture_io'] = False
            with patch.object(Messages, 'create', return_value=self._make_response()):
                ant_integration.patch()

                @vantra.trace
                def fn():
                    Messages.create(MagicMock(), model='claude-haiku-4-5',
                                    messages=[{'role': 'user', 'content': 'secret'}])
                fn()

            _wait_for(self.server, '/spans')
            spans = next(r for r in self.server.received if r['path'] == '/spans')['body']
            llm = next(s for s in spans if s.get('kind') == 'llm')
            assert llm.get('input') is None
            assert llm.get('output') is None
            assert llm['input_tokens'] == 15
            vantra._config['capture_io'] = True
        except ImportError:
            pytest.skip('anthropic not installed')
