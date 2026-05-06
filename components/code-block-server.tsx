import { highlight } from '@/lib/shiki'
import { CodeBlock } from './code-block'

export async function CodeBlockServer({ children, lang }: { children: string; lang: string }) {
  const html = await highlight(children, lang)
  return <CodeBlock html={html} raw={children} lang={lang} />
}
