-- Track which month the span counter belongs to so we can auto-reset
alter table organizations add column if not exists spans_month text default '';

-- Reset spans_this_month to 0 when new month starts (handled in app layer)
-- Index for fast plan + count lookups on ingest
create index if not exists idx_organizations_id on organizations(id);
