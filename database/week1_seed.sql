-- Vendors
insert into public.vendors (name, email, phone, website, city)
values
  ('Bella Bakery', 'bella@bakery.lu', '+352111111', 'https://bellabakery.lu', 'Luxembourg'),
  ('FixIt Phone Repair', 'support@fixit.lu', '+352222222', null, 'Esch-sur-Alzette'),
  ('Green Garden Care', 'hello@greengarden.lu', '+352333333', 'https://greengarden.lu', 'Differdange'),
  ('Studio Glow Beauty', 'book@studioglow.lu', '+352444444', 'https://studioglow.lu', 'Belval'),
  ('Lux Tutors', 'contact@luxtutors.lu', '+352555555', null, 'Luxembourg');

-- Listings 
insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published)
select id, 'Custom Cakes & Pastries', 'Food', 'Handmade cakes and desserts for all occasions.', 20, 250, array['cake','dessert','custom'], true
from public.vendors where name='Bella Bakery';

insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published)
select id, 'Smartphone & Tablet Repair', 'Services', 'Fast repair for phones and tablets.', 40, 200, array['repair','phone','tablet'], true
from public.vendors where name='FixIt Phone Repair';

insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published)
select id, 'Lawn & Hedge Maintenance', 'Home', 'Professional garden care and maintenance.', 25, 150, array['garden','lawn','maintenance'], true
from public.vendors where name='Green Garden Care';

insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published)
select id, 'Makeup & Hair for Events', 'Beauty', 'Bridal and event makeup & hairstyling services.', 30, 120, array['makeup','hair','event'], true
from public.vendors where name='Studio Glow Beauty';

insert into public.listings (vendor_id, title, category, description, price_min, price_max, tags, is_published)
select id, 'Math & CS Tutoring', 'Education', 'Private tutoring in mathematics and computer science.', 25, 70, array['math','cs','tutoring'], true
from public.vendors where name='Lux Tutors';
