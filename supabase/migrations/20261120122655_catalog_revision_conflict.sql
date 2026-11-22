-- Business conflicts must return immediately, not trigger PostgREST serialization retries.
-- https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b
begin;
create or replace function public.catalog_save(
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
    raise exception using errcode='PT409', message='Vehicle changed; reload before saving';
  end if;
  if p_mode = 'import' and current_revision is not null then
    select value->'files' into current_files from jsonb_array_elements(public.catalog_read(p_id)) value;
    if current_files is distinct from p_files then
      raise exception using errcode='PT409', message='Import differs from existing vehicle; refusing overwrite';
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
