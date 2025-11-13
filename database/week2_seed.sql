-- WEEK 2 SEED: add more listings and reviews safely
-- This script only inserts when needed (uses WHERE NOT EXISTS)
-- Adjust vendor names if your seed uses different ones.

-- === Extra listings for "Bella Bakery" ===
insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published, status)
select v.id, 'Custom Wedding Cake', 'Food',
       'Three-tier custom wedding cake with floral decoration.',
       120, 350, array['cake','wedding','custom'], true, 'published'
from public.vendors v
where v.name = 'Bella Bakery'
  and not exists (
    select 1 from public.listings l
    where l.vendor_id = v.id and lower(l.title) = lower('Custom Wedding Cake')
  );

insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published, status)
select v.id, 'Cupcakes Box (12 pcs)', 'Food',
       'Assorted flavors with customizable frosting.',
       18, 30, array['cupcake','party'], true, 'published'
from public.vendors v
where v.name = 'Bella Bakery'
  and not exists (
    select 1 from public.listings l
    where l.vendor_id = v.id and lower(l.title) = lower('Cupcakes Box (12 pcs)')
  );

-- === Extra listing for "Studio Glow Beauty" ===
insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published, status)
select v.id, 'Evening Makeup Package', 'Beauty',
       'Full glam evening makeup with lashes.',
       40, 90, array['makeup','evening','lashes'], true, 'published'
from public.vendors v
where v.name = 'Studio Glow Beauty'
  and not exists (
    select 1 from public.listings l
    where l.vendor_id = v.id and lower(l.title) = lower('Evening Makeup Package')
  );

-- === Extra listing for "Lux Tutors" ===
insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published, status)
select v.id, 'Exam Prep (per hour)', 'Education',
       'Targeted exam preparation in math/CS.',
       35, 60, array['tutoring','exam','math','cs'], true, 'published'
from public.vendors v
where v.name = 'Lux Tutors'
  and not exists (
    select 1 from public.listings l
    where l.vendor_id = v.id and lower(l.title) = lower('Exam Prep (per hour)')
  );

-- === A couple of reviews attached to existing listings ===
-- Pick the oldest and newest listing to guarantee existence
with first_l as (
  select id from public.listings order by created_at asc limit 1
),
last_l as (
  select id from public.listings order by created_at desc limit 1
)
insert into public.reviews (listing_id, rating, comment)
select id, 5, 'Great experience and very professional!' from first_l
union all
select id, 4, 'Good quality and on-time.' from last_l
on conflict do nothing;

-- Reviews for a Bella Bakery listing (if any exists)
insert into public.reviews (listing_id, rating, comment)
select l.id, 5, 'Delicious and beautiful cake. Highly recommend!'
from public.listings l
join public.vendors v on v.id = l.vendor_id
where v.name = 'Bella Bakery'
limit 1
on conflict do nothing;

-- Reviews for a Lux Tutors listing (if any exists)
insert into public.reviews (listing_id, rating, comment)
select l.id, 4, 'Clear explanations and helpful exercises.'
from public.listings l
join public.vendors v on v.id = l.vendor_id
where v.name = 'Lux Tutors'
limit 1
on conflict do nothing;

-- Optional: bump updated_at to simulate activity
update public.listings
set updated_at = now()
where updated_at is null;
