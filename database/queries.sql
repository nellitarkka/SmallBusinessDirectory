-- Search text - title/description
select id, title, category
from public.listings
where is_published = true
  and (title ilike '%repair%' or description ilike '%repair%')
order by created_at desc
limit 10;

-- Filter by category + tag
select id, title, tags
from public.listings
where is_published = true
  and category = 'Food'
  and tags @> array ['cake'];

-- Pagination (page 1, size 5)
select id, title
from public.listings
where is_published = true
order by created_at desc
limit 5 offset 0;

-- Vendor dashboard (by email)
select v.name, l.title, l.is_published, l.views, l.updated_at
from public.listings l
join public.vendors v on v.id = l.vendor_id
where v.email = 'bella@bakery.lu'
order by l.updated_at desc;

-- Simulate detail view hit
update public.listings
set views = views + 1
where id = (select id from public.listings limit 1)
returning id, title, views;

