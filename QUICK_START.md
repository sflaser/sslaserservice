# Quick Start Guide

## 1. Install & Run
```bash
npm install
npm run dev
```
Open http://localhost:5173

## 2. Admin Access

### Create Admin User
1. Go to Supabase Dashboard
2. Authentication → Users → Create User
3. Email & password of your choice
4. After creation, go to user's Profile
5. In `raw_app_meta_data`, add: `{"role":"admin"}`

### Login to Admin
- Visit `/login`
- Use your email/password
- Access dashboard at `/admin`

## 3. Add Content

### Case Studies
1. Go to Admin → Case Studies
2. Click "New Case Study"
3. Fill form:
   - Title, Description, Client Name, Industry
   - Image URL (external link or upload to Supabase Storage)
   - Add Results (Key: value pairs)
   - Toggle "Feature on homepage"
4. Save

### Podcasts
1. Go to Admin → Podcasts
2. Click "New Podcast"
3. Fill form:
   - Title, Description
   - Audio URL (link to MP3 file)
   - Cover Image, Episode Number, Guest Name
   - Duration in seconds
4. Save

## 4. Deploy to Netlify

### Option A: Via GitHub
1. Push to GitHub
2. Go to netlify.com
3. "New site from Git" → Connect GitHub
4. Select repository
5. Build command: `npm run build`
6. Publish: `dist`
7. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_SUPABASE_ANON_KEY`

### Option B: Direct Deploy
```bash
npm run build
# Upload dist/ folder to Netlify via drag & drop
```

## 5. Customize

### Colors
Edit `src/index.css`:
```css
--primary: #ff8c00;      /* Orange */
--secondary: #1a1a2e;    /* Dark blue */
--accent: #00d4ff;       /* Cyan */
```

### Company Info
Edit:
- `src/components/Contact.tsx` - Phone, email
- `src/components/Footer.tsx` - Links, info

## Tips

- All data stored in Supabase (never lost)
- Images can be hosted anywhere (provide full URL)
- Audio files can be hosted on any CDN or cloud storage
- Database auto-scales with Supabase
- Featured case studies show on homepage
- Latest podcasts auto-sort by date

## Support

Check SETUP.md for detailed information and troubleshooting.
