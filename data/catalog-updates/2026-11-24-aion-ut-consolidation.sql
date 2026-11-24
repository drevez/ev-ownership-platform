-- Explicit user request: remove Luxury; rename Premium to aion-ut-60kwh.
-- Data-only transaction. Retain Premium's active files/offers and preserve both histories.
-- Optimistic guards prevent discarding edits made after the reviewed snapshot.
begin;
do $$
declare premium_max integer; history_max integer; original_files jsonb;
begin
  perform 1 from public.vehicle_variants where id in ('aion-ut-premium','aion-ut-luxury') for update;
  if exists(select 1 from public.vehicle_variants where id='aion-ut-60kwh')
    or (select count(*) from public.vehicle_variants where (id='aion-ut-premium' and revision=1) or (id='aion-ut-luxury' and revision=2)) <> 2 then
    raise exception 'Aion UT snapshot changed; inspect before consolidating';
  end if;
  select coalesce(max(revision),0) into premium_max from public.vehicle_revisions where vehicle_id='aion-ut-premium';
  insert into public.vehicle_variants(id,model_slug,core,specifications,pricing_metadata,revision)
    select 'aion-ut-60kwh',model_slug,core || '{"id":"aion-ut-60kwh","variant":"60 kWh"}'::jsonb,
      specifications,pricing_metadata,revision from public.vehicle_variants where id='aion-ut-premium';
  select jsonb_build_object('consolidatedAt','2026-11-24','originalImports',coalesce((select jsonb_object_agg(vehicle_id,files) from public.vehicle_import_sources where vehicle_id in ('aion-ut-premium','aion-ut-luxury')),'{}'::jsonb),'retiredRecords',
    (public.catalog_read('aion-ut-premium') || public.catalog_read('aion-ut-luxury'))) into original_files;
  update public.vehicle_offers set vehicle_id='aion-ut-60kwh' where vehicle_id='aion-ut-premium';
  -- Historical snapshot bodies retain original IDs/actors; only their owning FK changes.
  update public.vehicle_revisions set vehicle_id='aion-ut-60kwh' where vehicle_id='aion-ut-premium';
  update public.vehicle_revisions set vehicle_id='aion-ut-60kwh',revision=revision+premium_max where vehicle_id='aion-ut-luxury';
  -- Archive lossless import sources and both final old documents privately before deletion.
  insert into public.vehicle_import_sources(vehicle_id,files) values('aion-ut-60kwh',original_files);
  delete from public.vehicle_import_sources where vehicle_id in ('aion-ut-premium','aion-ut-luxury');
  delete from public.vehicle_variants where id in ('aion-ut-premium','aion-ut-luxury');
  select coalesce(max(revision),0)+1 into history_max from public.vehicle_revisions where vehicle_id='aion-ut-60kwh';
  update public.vehicle_variants set revision=history_max,updated_at=now() where id='aion-ut-60kwh';
  insert into public.vehicle_revisions(vehicle_id,revision,files,actor)
    values('aion-ut-60kwh',history_max,(public.catalog_read('aion-ut-60kwh')->0->'files'),'catalog-consolidation:2026-11-24:user-request');
end $$;
commit;
