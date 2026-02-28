# CMS Setup (Blog + Products + Purchase)

This project now supports:
1. Admin upload/publish for blog posts
2. Admin upload/publish for products
3. Frontend auto-display for published blog posts and products
4. Product "Buy Now" links for customers

## 1) Configure Supabase
1. Create a Supabase project.
2. In Supabase SQL editor, run: `database/supabase_cms_schema.sql`
3. In Supabase Auth, create your admin user (email/password).
4. Copy project values from Supabase:
   - Project URL
   - anon public key

## 2) Configure this website
Edit file `assets/js/cms-config.js`:
- `supabaseUrl`
- `supabaseAnonKey`
- `storageBucket` (default: `site-assets`)

## 3) Deploy
1. Commit and push to GitHub
2. In Netlify, run **Deploy project without cache**
3. Verify pages:
   - Frontend: `/` (products and blog sections)
   - Admin: `/admin.html`

## 4) Content workflow
1. Open `/admin.html`
2. Sign in with Supabase admin account
3. Publish blog posts and products
4. Frontend updates automatically after publish

## Notes
- Product purchase currently uses `purchase_url` links (for example Stripe Payment Links, Shopify product links, etc.).
- If you want native cart + checkout next, we can add Stripe Checkout via Netlify Functions.
