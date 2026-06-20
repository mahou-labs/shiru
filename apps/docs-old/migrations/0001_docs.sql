create table if not exists docs (
  id text primary key not null,
  site_id text not null,
  slug text not null,
  title text not null,
  description text not null default '',
  order_index integer not null default 100,
  content_hash text not null,
  updated_at text not null
);

create unique index if not exists docs_site_slug_idx on docs (site_id, slug);
create index if not exists docs_site_order_idx on docs (site_id, order_index, slug);
