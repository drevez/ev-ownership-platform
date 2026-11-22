-- Catalog access: public read, server-only writes. No credentials in migrations.
begin;
create table public.vehicle_models (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]*$'),
  brand text not null check (length(trim(brand)) > 0),
  name text not null check (length(trim(name)) > 0),
  unique (brand, name)
);
create table public.vehicle_variants (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]*$'),
  model_slug text not null references public.vehicle_models(slug),
  core jsonb not null check (jsonb_typeof(core) = 'object'),
  specifications jsonb not null check (jsonb_typeof(specifications) = 'object'),
  pricing_metadata jsonb not null check (jsonb_typeof(pricing_metadata) = 'object'),
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
create index vehicle_variants_model_idx on public.vehicle_variants(model_slug);
create table public.vehicle_offers (
  vehicle_id text not null references public.vehicle_variants(id) on delete cascade,
  position integer not null check (position >= 0),
  condition text not null check (condition in ('new', 'used')),
  market_scope text not null check (market_scope in ('official_pt','new_import','used_pt','imported_to_pt','unknown')),
  status text not null check (status in ('available','not_sold_new','not_enough_data','not_sold_in_pt','unknown')),
  price_from numeric check (price_from > 0),
  price_to numeric check (price_to > 0),
  details jsonb not null check (jsonb_typeof(details) = 'object'),
  primary key (vehicle_id, position),
  check (price_to is null or price_from is null or price_to >= price_from)
);
create index vehicle_offers_filter_idx on public.vehicle_offers(condition, market_scope, price_from);
-- Append-only snapshots include prices and the actor, providing price/change history.
create table public.vehicle_revisions (
  id bigint generated always as identity primary key,
  vehicle_id text not null references public.vehicle_variants(id),
  revision integer not null,
  files jsonb not null,
  actor text not null,
  created_at timestamptz not null default now(),
  unique (vehicle_id, revision)
);
-- Lossless originals retained privately, including fields outside the canonical pricing schema.
create table public.vehicle_import_sources (
  vehicle_id text primary key references public.vehicle_variants(id),
  files jsonb not null,
  imported_at timestamptz not null default now()
);

alter table public.vehicle_models enable row level security;
alter table public.vehicle_variants enable row level security;
alter table public.vehicle_offers enable row level security;
alter table public.vehicle_revisions enable row level security;
alter table public.vehicle_import_sources enable row level security;
create policy catalog_models_read on public.vehicle_models for select to anon, authenticated using (true);
create policy catalog_variants_read on public.vehicle_variants for select to anon, authenticated using (true);
create policy catalog_offers_read on public.vehicle_offers for select to anon, authenticated using (true);
revoke all on public.vehicle_models, public.vehicle_variants, public.vehicle_offers,
  public.vehicle_revisions, public.vehicle_import_sources from anon, authenticated;
grant select on public.vehicle_models, public.vehicle_variants, public.vehicle_offers to anon, authenticated;
grant all on public.vehicle_models, public.vehicle_variants, public.vehicle_offers,
  public.vehicle_revisions, public.vehicle_import_sources to service_role;
grant usage, select on sequence public.vehicle_revisions_id_seq to service_role;

create function public.catalog_read(p_id text default null)
returns jsonb language sql stable security invoker set search_path = '' as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', v.id, 'revision', v.revision,
    'files', v.specifications || jsonb_build_object(
      'core', v.core || jsonb_build_object('id',v.id,'brand',m.brand,'model',m.name),
      'pricing', v.pricing_metadata || jsonb_build_object('offers', coalesce((
        select jsonb_agg(o.details || jsonb_build_object(
          'condition',o.condition,'marketScope',o.market_scope,'status',o.status,
          'priceFrom',o.price_from,'priceTo',o.price_to
        ) order by o.position) from public.vehicle_offers o where o.vehicle_id = v.id
      ), '[]'::jsonb))
    )
  ) order by v.id), '[]'::jsonb)
  from public.vehicle_variants v join public.vehicle_models m on m.slug = v.model_slug
  where p_id is null or v.id = p_id;
$$;
revoke all on function public.catalog_read(text) from public;
grant execute on function public.catalog_read(text) to anon, authenticated, service_role;

create function public.catalog_save(
  p_id text, p_model_slug text, p_files jsonb, p_actor text,
  p_expected_revision integer default null, p_mode text default 'update', p_original jsonb default null
) returns integer language plpgsql security invoker set search_path = '' as $$
declare
  current_revision integer;
  next_revision integer;
  current_files jsonb;
  item jsonb;
  idx integer := 0;
  module_name text;
begin
  if p_mode not in ('create','update','import') then raise exception 'Invalid save mode'; end if;
  if p_id is null or p_id !~ '^[a-z0-9][a-z0-9-]*$' or p_files->'core'->>'id' is distinct from p_id then
    raise exception 'Invalid vehicle identity';
  end if;
  if nullif(trim(p_files->'core'->>'brand'),'') is null or nullif(trim(p_files->'core'->>'model'),'') is null then
    raise exception 'Brand and model required';
  end if;
  foreach module_name in array array['core','battery','charging','comfort','dimensions','efficiency','pricing'] loop
    if jsonb_typeof(p_files->module_name) is distinct from 'object' then raise exception 'Invalid module %', module_name; end if;
  end loop;
  if jsonb_typeof(p_files->'pricing'->'offers') is distinct from 'array' then raise exception 'Canonical offers required'; end if;
  if nullif(trim(p_actor),'') is null then raise exception 'Actor required'; end if;
  -- Serializes creates as well as updates of the same identity.
  perform pg_advisory_xact_lock(hashtextextended(p_id, 0));
  select revision into current_revision from public.vehicle_variants where id = p_id for update;
  if p_mode = 'create' and current_revision is not null then raise exception using errcode='23505', message='Vehicle already exists'; end if;
  if p_mode = 'update' and current_revision is null then raise exception using errcode='P0002', message='Vehicle not found'; end if;
  if p_mode = 'update' and p_expected_revision is distinct from current_revision then
    raise exception using errcode='40001', message='Vehicle changed; reload before saving';
  end if;
  if p_mode = 'import' and current_revision is not null then
    select value->'files' into current_files from jsonb_array_elements(public.catalog_read(p_id)) value;
    if current_files is distinct from p_files then
      raise exception using errcode='40001', message='Import differs from existing vehicle; refusing overwrite';
    end if;
    return current_revision;
  end if;
  insert into public.vehicle_models(slug,brand,name)
    values (p_model_slug,p_files->'core'->>'brand',p_files->'core'->>'model')
    on conflict (slug) do nothing;
  if not exists (select 1 from public.vehicle_models where slug=p_model_slug
    and brand=p_files->'core'->>'brand' and name=p_files->'core'->>'model') then
    raise exception 'Model slug collision';
  end if;
  next_revision := coalesce(current_revision,0)+1;
  insert into public.vehicle_variants(id,model_slug,core,specifications,pricing_metadata,revision)
    values (p_id,p_model_slug,(p_files->'core') - array['id','brand','model'],
      p_files - array['core','pricing'],(p_files->'pricing')-'offers',next_revision)
    on conflict(id) do update set model_slug=excluded.model_slug,core=excluded.core,
      specifications=excluded.specifications,pricing_metadata=excluded.pricing_metadata,
      revision=excluded.revision,updated_at=now();
  delete from public.vehicle_offers where vehicle_id=p_id;
  for item in select value from jsonb_array_elements(p_files->'pricing'->'offers') loop
    insert into public.vehicle_offers(vehicle_id,position,condition,market_scope,status,price_from,price_to,details)
      values(p_id,idx,item->>'condition',item->>'marketScope',item->>'status',
        (item->>'priceFrom')::numeric,(item->>'priceTo')::numeric,
        item-array['condition','marketScope','status','priceFrom','priceTo']);
    idx := idx+1;
  end loop;
  insert into public.vehicle_revisions(vehicle_id,revision,files,actor) values(p_id,next_revision,p_files,p_actor);
  if p_original is not null then
    insert into public.vehicle_import_sources(vehicle_id,files) values(p_id,p_original) on conflict(vehicle_id) do nothing;
  end if;
  return next_revision;
end;
$$;
revoke all on function public.catalog_save(text,text,jsonb,text,integer,text,jsonb) from public,anon,authenticated;
grant execute on function public.catalog_save(text,text,jsonb,text,integer,text,jsonb) to service_role;
commit;
