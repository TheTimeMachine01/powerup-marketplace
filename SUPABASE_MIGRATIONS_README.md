# Supabase SQL Migrations - Run in Order

Run these SQL migrations in your Supabase SQL Editor in this exact order:

## 1. Update Profiles Table
File: `supabase/migrations/update_profiles_schema.sql`
- Renames `phone_number` → `phone`
- Renames `address` → `shipping_address`
- Adds `user_id` column
- Adds `created_at` column
- Removes `staff_id` and `role` (moving to separate user_roles table)

## 2. Create User Roles Table
File: `supabase/migrations/create_user_roles_table.sql`
- Creates `user_roles` table with: id, user_id, role, created_at, updated_at
- Adds RLS policies for user roles management
- Links to auth.users via foreign key

## 3. Update Products Table
File: `supabase/migrations/update_products_schema.sql`
- Ensures `scrap_value` column (renames from `scrap_val` if needed)
- Adds `warranty_months` and `vehicle_type` columns
- Adds public read RLS policy
- Creates performance indexes

## 4. Update Carts Table
File: `supabase/migrations/update_carts_schema.sql`
- Removes `with_exchange` column (not in current schema)
- Ensures quantity and created_at columns exist
- Adds RLS policies for user-owned carts

## 5. Update Orders Table
File: `supabase/migrations/update_orders_schema.sql`
- Adds `status`, `total_amount`, `created_at`, `updated_at` columns
- Renames `delivery_address` → `shipping_address`
- Adds coupon_id foreign key
- Adds RLS policies and triggers

## 6. Ensure Coupons Table
File: `supabase/migrations/ensure_coupons_schema.sql`
- Creates/updates coupons table with all required columns
- Adds RLS policies for active coupon visibility
- Adds admin management policy

## How to Run:

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in left sidebar
3. Click **New Query** or **New Builder Query**
4. Copy and paste SQL from each file **in order** (1 through 6)
5. Click **Run** after each migration
6. Wait for "Query Complete" before moving to next migration

**Important:** Run them in order - later migrations may depend on earlier ones!

## Verification:

After running all migrations, check:
- ✅ `profiles` table has: id, user_id, full_name, phone, shipping_address, avatar_url, created_at, updated_at
- ✅ `user_roles` table created with: id, user_id, role, created_at, updated_at
- ✅ `products` table has: scrap_value (not scrap_val)
- ✅ `carts` table: no with_exchange column
- ✅ `orders` table has: status, total_amount, shipping_address, coupon_id
- ✅ `coupons` table has: code, discount_percent, valid_until, max_uses, is_active
