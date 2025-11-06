
create or replace function search_leads(search_term text)
returns table (
  email text,
  display_name text,
  campaigns text[],
  source_data jsonb,
  date_added timestamptz,
  last_updated timestamptz
)
language plpgsql
as $$
begin
  return query
  select
    l.email,
    l.display_name,
    l.campaigns,
    l.source_data,
    l.date_added,
    l.last_updated
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
    );
end;
$$;
