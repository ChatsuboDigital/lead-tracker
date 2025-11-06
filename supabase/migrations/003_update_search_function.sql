create or replace function search_leads(
  search_term text,
  page_limit int,
  page_offset int
)
returns table (
  email text,
  display_name text,
  campaigns text[],
  source_data jsonb,
  date_added timestamptz,
  last_updated timestamptz,
  total_count bigint
)
language plpgsql
as $$
begin
  return query
  with filtered_leads as (
    select
      l.email,
      l.display_name,
      l.campaigns,
      l.source_data,
      l.date_added,
      l.last_updated,
      count(*) over() as full_count
    from
      leads l
    where
      search_term is null or search_term = '' or
      l.email ilike '%' || search_term || '%' or
      l.display_name ilike '%' || search_term || '%' or
      exists (
        select 1
        from unnest(l.campaigns) as campaign_name
        where campaign_name ilike '%' || search_term || '%'
      )
  )
  select
    fl.email,
    fl.display_name,
    fl.campaigns,
    fl.source_data,
    fl.date_added,
    fl.last_updated,
    fl.full_count
  from
    filtered_leads fl
  order by
    fl.date_added desc
  limit
    page_limit
  offset
    page_offset;
end;
$$;
