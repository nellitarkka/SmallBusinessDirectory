-- PATCH: resolve vendor user correctly for inquiries + messages

CREATE OR REPLACE FUNCTION public.resolve_listing_vendor_user(p_listing_id int)
RETURNS bigint
LANGUAGE plpgsql
AS $fn$
DECLARE
  l_direct_col text;
  l_vendor_id_col text;
  v_vendor_id int;
  v_vendor_user_col text;
  v_user bigint;
BEGIN
  -- 1) If listings has a direct "vendor user id" column, use it
  SELECT column_name INTO l_direct_col
  FROM information_schema.columns
  WHERE table_schema='public'
    AND table_name='listings'
    AND column_name IN ('vendor_user_id','user_id','owner_id')
  ORDER BY CASE column_name
    WHEN 'vendor_user_id' THEN 1
    WHEN 'user_id' THEN 2
    WHEN 'owner_id' THEN 3
    ELSE 99 END
  LIMIT 1;

  IF l_direct_col IS NOT NULL THEN
    EXECUTE format('SELECT %I::bigint FROM public.listings WHERE id = $1', l_direct_col)
      INTO v_user
      USING p_listing_id;

    IF v_user IS NULL THEN
      RAISE EXCEPTION 'Listing not found or has no owner user' USING ERRCODE='22023';
    END IF;

    RETURN v_user;
  END IF;

  -- 2) Otherwise, resolve via listings.vendor_id -> vendors.<user_column>
  SELECT column_name INTO l_vendor_id_col
  FROM information_schema.columns
  WHERE table_schema='public'
    AND table_name='listings'
    AND column_name IN ('vendor_id')
  LIMIT 1;

  IF l_vendor_id_col IS NULL THEN
    RAISE EXCEPTION 'Cannot resolve vendor: listings has no vendor_user_id/user_id/owner_id and no vendor_id'
      USING ERRCODE='22023';
  END IF;

  EXECUTE format('SELECT %I FROM public.listings WHERE id = $1', l_vendor_id_col)
    INTO v_vendor_id
    USING p_listing_id;

  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Listing not found or vendor_id is NULL' USING ERRCODE='22023';
  END IF;

  -- detect vendor table's user column
  SELECT column_name INTO v_vendor_user_col
  FROM information_schema.columns
  WHERE table_schema='public'
    AND table_name='vendors'
    AND column_name IN ('user_id','owner_id','vendor_user_id')
  ORDER BY CASE column_name
    WHEN 'user_id' THEN 1
    WHEN 'owner_id' THEN 2
    WHEN 'vendor_user_id' THEN 3
    ELSE 99 END
  LIMIT 1;

  IF v_vendor_user_col IS NULL THEN
    RAISE EXCEPTION 'Cannot resolve vendor user: vendors has no user_id/owner_id/vendor_user_id'
      USING ERRCODE='22023';
  END IF;

  EXECUTE format('SELECT %I::bigint FROM public.vendors WHERE id = $1', v_vendor_user_col)
    INTO v_user
    USING v_vendor_id;

  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Vendor % has no linked user id', v_vendor_id USING ERRCODE='22023';
  END IF;

  RETURN v_user;
END;
$fn$;

-- Patch create_inquiry to use the resolver
CREATE OR REPLACE FUNCTION public.create_inquiry(
  p_customer_id bigint,
  p_listing_id int
)
RETURNS bigint
LANGUAGE plpgsql
AS $fn$
DECLARE
  qid bigint;
  v_vendor bigint;
BEGIN
  SELECT id INTO qid
  FROM public.inquiries
  WHERE customer_id = p_customer_id
    AND listing_id = p_listing_id
    AND status = 'open'
  LIMIT 1;

  IF qid IS NOT NULL THEN
    RETURN qid;
  END IF;

  v_vendor := public.resolve_listing_vendor_user(p_listing_id);

  INSERT INTO public.inquiries(customer_id, vendor_user_id, listing_id, status)
  VALUES (p_customer_id, v_vendor, p_listing_id, 'open')
  RETURNING id INTO qid;

  RETURN qid;
END;
$fn$;

-- Patch send_message too (so it doesn't accidentally message vendor_id instead of vendor user)
CREATE OR REPLACE FUNCTION public.send_message(
  p_sender_id bigint,
  p_listing_id int,
  p_subject text,
  p_content text
)
RETURNS int
LANGUAGE plpgsql
AS $fn$
DECLARE
  verified boolean;
  v_receiver bigint;
  mid int;
BEGIN
  SELECT is_email_verified INTO verified
  FROM public.users
  WHERE id = p_sender_id;

  IF verified IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'Email not verified' USING ERRCODE='42501';
  END IF;

  PERFORM public.enforce_rate_limit(p_sender_id, 'send_message', 10);

  v_receiver := public.resolve_listing_vendor_user(p_listing_id);

  INSERT INTO public.messages(sender_id, recipient_id, listing_id, subject, content, created_at, read)
  VALUES (p_sender_id::int, v_receiver::int, p_listing_id, NULLIF(p_subject,''), p_content, now(), false)
  RETURNING id INTO mid;

  RETURN mid;
END;
$fn$;
