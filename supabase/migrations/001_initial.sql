-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text default 'free', -- 'free' | 'starter' | 'growth' | 'enterprise'
  spans_this_month integer default 0,
  created_at timestamptz default now()
);

-- Users
create table users (
  id uuid primary key references auth.users,
  org_id uuid references organizations(id),
  email text,
  role text default 'member', -- 'owner' | 'member'
  created_at timestamptz default now()
);

-- API Keys
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  key_hash text unique not null,
  name text,
  created_at timestamptz default now(),
  last_used_at timestamptz
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text not null,
  created_at timestamptz default now()
);

-- Traces
create table traces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  org_id uuid references organizations(id),
  trace_id text not null,
  name text,
  start_time timestamptz not null,
  end_time timestamptz,
  duration_ms integer,
  status text default 'ok', -- 'ok' | 'error' | 'timeout'
  total_tokens integer default 0,
  total_cost_usd numeric(10,6) default 0,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Spans
create table spans (
  id uuid primary key default gen_random_uuid(),
  trace_id uuid references traces(id) on delete cascade,
  org_id uuid references organizations(id),
  parent_span_id uuid references spans(id),
  span_id text not null,
  name text not null,
  kind text not null, -- 'llm' | 'tool' | 'retrieval' | 'chain' | 'agent'
  start_time timestamptz not null,
  end_time timestamptz,
  duration_ms integer,
  status text default 'ok',
  error_message text,
  model text,
  provider text,
  input_tokens integer,
  output_tokens integer,
  cost_usd numeric(10,6),
  temperature numeric,
  input jsonb,
  output jsonb,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Alert rules
create table alert_rules (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  project_id uuid references projects(id),
  name text not null,
  metric text not null, -- 'error_rate' | 'p95_latency' | 'cost_per_hour'
  threshold numeric not null,
  window_minutes integer default 15,
  email_recipients text[],
  enabled boolean default true,
  created_at timestamptz default now()
);

-- Indexes
create index on traces(org_id, created_at desc);
create index on traces(project_id, created_at desc);
create index on spans(trace_id);
create index on spans(org_id, created_at desc);
create index on spans(model);

-- Row Level Security
alter table organizations enable row level security;
alter table users enable row level security;
alter table api_keys enable row level security;
alter table projects enable row level security;
alter table traces enable row level security;
alter table spans enable row level security;
alter table alert_rules enable row level security;

-- RLS Policies: users can only see their own org's data
create policy "org_isolation" on organizations
  for all using (id = (select org_id from users where id = auth.uid()));

create policy "org_isolation" on users
  for all using (org_id = (select org_id from users where id = auth.uid()));

create policy "org_isolation" on api_keys
  for all using (org_id = (select org_id from users where id = auth.uid()));

create policy "org_isolation" on projects
  for all using (org_id = (select org_id from users where id = auth.uid()));

create policy "org_isolation" on traces
  for all using (org_id = (select org_id from users where id = auth.uid()));

create policy "org_isolation" on spans
  for all using (org_id = (select org_id from users where id = auth.uid()));

create policy "org_isolation" on alert_rules
  for all using (org_id = (select org_id from users where id = auth.uid()));
