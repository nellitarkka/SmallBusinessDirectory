-- WEEK 2 QUERIES: useful tests & demos

-- 1) Newest published listings
select id, title, category, created_at
from public.listings
where is_published = true and status = 'published'
order by created_at desc
limit 10;

-- 2) Simple search using the view (backend can parameterize the 'needle')
-- Replace 'cake' with your search term to test
select id, title, category, created_at
from public.vw_listings_search
where is_published = true
  and status = 'published'
  and search_text ilike '%' || 'cake' || '%'
order by created_at desc
limit 10;

-- 3) Filter by category + tag + pagination (page 2, size 5 as example)
select id, title, tags, created_at
from public.listings
where is_published = true and status = 'published'
  and category = 'Food'
  and tags @> array['cake']   -- listing must contain 'cake' tag
order by created_at desc
limit 5 offset 5;

-- 4) Vendor dashboard: number of published listings + first/last activity
select v.name as vendor,
       count(*) as published_count,
       min(l.created_at) as first_post,
       max(coalesce(l.updated_at,l.created_at)) as last_update
from public.listings l
join public.vendors v on v.id = l.vendor_id
where l.is_published = true and l.status = 'published'
group by v.name
order by published_count desc, last_update desc;

-- 5) Ratings summary per listing (if reviews exist)
select l.title,
       round(avg(r.rating)::numeric,2) as avg_rating,
       count(*) as n_reviews
from public.reviews r
join public.listings l on l.id = r.listing_id
group by l.title
order by avg_rating desc nulls last, n_reviews desc;

-- 6) Recently updated draft listings (for an admin queue)
select id, title, status, updated_at
from public.listings
where status = 'draft'
order by updated_at desc nulls last, created_at desc
limit 10;

-- 7) Vendor + listings combined (using helper view)
select id, title, vendor_name, vendor_city, created_at
from public.vw_listings_with_vendor
order by created_at desc
limit 10;

-- 8) Categories overview (if you enabled categories table)
select c.name as category, count(l.id) as n_listings
from public.categories c
left join public.listings l on l.category = c.name
group by c.name
order by n_listings desc, c.name;

-- 9) Email format validation helper (Week 2 constraint follow-up)
-- Show vendors that violate the regex (should be none after cleanup/validation)
select id, name, email
from public.vendors
where email !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$';

-- 10) (Run later) Validate the email constraint once all rows are fixed
-- alter table public.vendors validate constraint chk_email_format;
