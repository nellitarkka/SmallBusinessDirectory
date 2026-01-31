# Database – Manual Verification & Validation Queries  
**Deliverable 3 – Security, Messaging & Abuse Prevention**

This document contains **manual SQL queries** used to verify and validate the
database-level security mechanisms, messaging system, inquiry workflow, and
abuse prevention logic implemented for **Deliverable 3**.

These queries are **not part of the migration pipeline** and are **not executed automatically**.  
They are intended for:
- manual testing,
- debugging,
- validation during development,
- and demonstration of correct system behavior.

---

## 1. Rate Limiting – Existence Check

Verify that the rate-limiting table exists and is populated.

```sql
SELECT * FROM public.rate_limits LIMIT 1;
```

Verify that the rate-limiting and security-related functions exist.

```sql
SELECT proname
FROM pg_proc
WHERE proname IN ('verify_email', 'send_message', 'enforce_rate_limit');
```

---

## 2. Direct Messaging – Validation
Test the direct messaging function (non-inquiry message).

```sql
SELECT public.send_message(48, 36, 'hi', 'test message');
```

---

## 3. User Email Verification Logic
Check user schema and email verification flag.

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='users'
ORDER BY ordinal_position;
```

Mark a user as email-verified.
```sql
UPDATE public.users
SET is_email_verified = true
WHERE id = 48;
```

---

## 4. Inquiry Creation & Messaging Flow
Send an inquiry message for a listing.
```sql
SELECT public.send_inquiry_message(
    48,      -- customer_id
    36,      -- listing_id
    NULL,    -- optional subject
    'hi',
    'test inquiry message'
);
```

Verify inquiry creation.
```sql
SELECT id, customer_id, vendor_user_id, listing_id, status
FROM public.inquiries
ORDER BY id DESC
LIMIT 5;
```

Verify inquiry-related messages.
```sql
SELECT id, inquiry_id, sender_id, recipient_id, listing_id, content
FROM public.messages
WHERE inquiry_id IS NOT NULL
ORDER BY id DESC
LIMIT 5;
```

---

## 5. Inquiry Status Updates & Abuse Tracking
Retrieve latest inquiry identifiers.
```sql
SELECT id, vendor_user_id, customer_id
FROM public.inquiries
ORDER BY id DESC
LIMIT 1;
```

Mark an inquiry as a "no_show" (vendor action).
```sql
SELECT public.set_inquiry_status(50, 2, 'no_show');
```

Verify that ghost strikes increased for the customer.
```sql
SELECT id, ghost_strikes
FROM public.users
WHERE id = 48;
```

---

## 6. Schema Consistency Checks
Verify listings table structure.
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='listings'
ORDER BY ordinal_position;
```

Verify vendors table structure.
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='vendors'
ORDER BY ordinal_position;
```

Inspect a concrete listing used during testing.
```sql
SELECT *
FROM public.listings
WHERE id = 36;
```

---

## 7. Email Verification Enforcement Check
Reset email verification.
```sql
UPDATE public.users
SET is_email_verified = false
WHERE id = 48;
```

Attempt to send an inquiry again (expected to fail or be blocked).
```sql
SELECT public.send_inquiry_message(
    48,
    36,
    NULL,
    'hi',
    'test inquiry message'
);
```