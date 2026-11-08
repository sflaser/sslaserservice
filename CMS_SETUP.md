# CMS Setup (Blog + Products + Purchase)

This project now supports:
1. Admin upload/publish for blog posts
2. Admin upload/publish for products
3. Frontend auto-display for published blog posts and products
4. Product primary links plus optional brochure/PDF attachments

## 1) Configure Supabase
1. Create a Supabase project.
2. In the trusted Supabase dashboard, create the designated owner in **Authentication → Users**: `xiaodong@sflaser.net` (email/password). Complete email confirmation, or use the dashboard's confirmed-user creation option after verifying that this is the intended owner.
3. **Only after the owner exists and is confirmed**, open the project's SQL editor as a project administrator and run the **entire** `database/supabase_cms_schema.sql` file in one operation. It checks for exactly one confirmed owner before changing any tables or policies, then adds that user's ID to the private CMS administrator list. A missing or unconfirmed owner produces an explicit error; it does not silently finish with no administrator.
4. Verify the result in the trusted SQL editor:

   ```sql
   select u.email,
          u.email_confirmed_at is not null as email_confirmed,
          a.user_id is not null as cms_admin
   from auth.users u
   left join cms_private.cms_admins a on a.user_id = u.id
   where lower(u.email) = 'xiaodong@sflaser.net';
   ```

   Expected: **exactly one row** for `xiaodong@sflaser.net`, with both `email_confirmed` and `cms_admin` equal to `true`. Stop setup if this is not the result. Do not grant every registered user CMS access or put a service-role key in the website to work around a permission error.
5. Copy project values from Supabase:
   - Project URL
   - anon public key

If you previously ran the schema before creating the owner, create/confirm the designated owner first, then rerun the entire schema and repeat the verification query. The schema is repeatable and retains existing articles and products. If a failed SQL run leaves an open transaction, run `ROLLBACK` before retrying. Creating an Auth user alone does **not** grant CMS access; additional administrators require a separate, explicitly authorized action through the trusted project administration channel.

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
4. For products, you can import Markdown with `image_url`, `brochure_url`, `purchase_url`, and a full description, then save the product after uploading an image or brochure PDF if needed. If you are publishing bilingual brochures, keep the English PDF as the primary URL and place the Spanish PDF next to it with a `-es.pdf` suffix.
4. Frontend updates automatically after publish

## Notes
- Product `purchase_url` is now a general primary link. It can point to a checkout page, RFQ page, or product detail page.
- Use `brochure_url` for the primary downloadable brochure or PDF manual. If you place a sibling PDF with the same base name and a `-es.pdf` suffix, the frontend will surface a Spanish download link automatically. The admin form can also upload a brochure PDF to the public storage bucket.
- If you want native cart + checkout next, we can add Stripe Checkout via Netlify Functions.
