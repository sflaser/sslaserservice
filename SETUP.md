# Sky Fire Laser Website - Setup Guide

## Overview
This is a modern, professional website for Sky Fire Laser with:
- Beautiful UI/UX with smooth animations
- Case Studies management system
- Podcast hosting and management
- Admin dashboard for content management
- Supabase database integration
- Responsive design for all devices

## Project Structure

```
src/
├── components/          # React components
│   ├── admin/          # Admin panel components
│   ├── Navigation.tsx   # Site navigation
│   ├── Hero.tsx        # Hero section
│   ├── Services.tsx    # Services showcase
│   ├── FeaturedCaseStudies.tsx
│   ├── FeaturedPodcasts.tsx
│   ├── Partners.tsx    # Brand partners
│   ├── Contact.tsx     # Contact form
│   └── Footer.tsx
├── pages/
│   ├── Admin.tsx       # Admin dashboard
│   └── Login.tsx       # Admin login
├── styles/             # CSS modules
├── lib/
│   └── supabase.ts     # Supabase client & types
├── Router.tsx          # Route handler
├── App.tsx             # Main app component
└── main.tsx            # Entry point
```

## Features

### 1. Homepage
- Animated hero section with statistics
- Services overview
- Featured case studies
- Featured podcasts
- Partner logos
- Contact form
- Professional footer

### 2. Case Studies Management
- Create/Edit/Delete case studies
- Feature on homepage
- Track results and metrics
- Client information
- Industry tags

### 3. Podcast Management
- Upload podcast metadata
- Audio file hosting (via external URLs)
- Episode numbers and guest information
- Duration tracking
- In-app audio player

### 4. Admin Dashboard
- Secure login system
- Content management interface
- CRUD operations for case studies and podcasts
- Real-time database synchronization

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Database Setup
The database tables (case_studies and podcasts) are automatically created via migrations.

Tables created:
- `case_studies` - Stores case study content
- `podcasts` - Stores podcast information

Both tables have:
- Row Level Security (RLS) enabled
- Public read access
- Admin-only write/update/delete access

### 4. Run Locally
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 5. Build for Production
```bash
npm run build
```

## Admin Access

### Default Admin Account
To create an admin account, use Supabase Auth:
1. Go to your Supabase project
2. Navigate to Authentication > Users
3. Create a new user with email/password
4. Set their role in `raw_app_meta_data`: `{ "role": "admin" }`

### Login URL
`/login` - Access the admin login page

### Admin Dashboard
`/admin` - Manage case studies and podcasts

## Deployment

### Option 1: Netlify (Recommended)
1. Push code to GitHub
2. Connect repository to Netlify
3. Set environment variables in Netlify dashboard
4. Auto-deploys on every push to main

### Option 2: Manual Deployment
1. Build the project: `npm run build`
2. Upload the `dist` folder to your hosting provider
3. Set environment variables on your hosting platform

## Database Schema

### case_studies Table
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `image_url` (text)
- `client_name` (text)
- `industry` (text)
- `results` (jsonb) - Key-value pairs of results
- `featured` (boolean)
- `published_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### podcasts Table
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `image_url` (text)
- `audio_url` (text) - Link to audio file
- `episode_number` (integer)
- `guest_name` (text)
- `duration` (integer) - In seconds
- `published_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Security

- Row Level Security (RLS) enabled on all tables
- Public read access for published content
- Admin-only write access
- Environment variables protected
- Secure password-based authentication
- Admin role validation

## Customization

### Colors
Edit `src/index.css` CSS variables:
- Primary color: `--primary: #ff8c00` (orange)
- Secondary: `--secondary: #1a1a2e` (dark blue)
- Accent: `--accent: #00d4ff` (cyan)

### Content
- Services: Edit `src/components/Services.tsx`
- Partners: Edit `src/components/Partners.tsx`
- Contact info: Edit `src/components/Contact.tsx` and `Footer.tsx`

## Troubleshooting

### Can't login?
- Verify Supabase environment variables are correct
- Check that the user exists in Supabase Auth
- Ensure user has admin role in metadata

### Case studies not showing?
- Check database connection
- Verify data is in Supabase
- Check browser console for errors

### Build errors?
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version (v18+)
- Verify all environment variables are set

## Support

For issues or questions:
1. Check Supabase documentation
2. Review browser console for errors
3. Check database directly in Supabase console
