# Deployment Checklist

## Before Deploying

### Local Testing
- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` and test locally
- [ ] Test homepage scrolling and animations
- [ ] Test admin login at `/login`
- [ ] Test case studies management
- [ ] Test podcast management
- [ ] Test contact form
- [ ] Test responsive design (mobile, tablet, desktop)

### Code Preparation
- [ ] All environment variables in `.env`
- [ ] No console errors or warnings
- [ ] Build succeeds: `npm run build`
- [ ] `dist` folder generated correctly
- [ ] No sensitive data in code

### Supabase Preparation
- [ ] Database tables created (migrations applied)
- [ ] At least one admin user created
- [ ] Admin user has `{"role":"admin"}` in metadata
- [ ] RLS policies in place
- [ ] Environment variables noted

## GitHub Setup

- [ ] Create GitHub repository
- [ ] Push code: `git push -u origin main`
- [ ] Verify all files are there
- [ ] Check `.gitignore` excludes `/dist` and `.env`

## Netlify Deployment

### Option A: From GitHub (Recommended)

1. [ ] Go to https://netlify.com
2. [ ] Click "New site from Git"
3. [ ] Choose GitHub
4. [ ] Authorize Netlify with GitHub
5. [ ] Select your repository
6. [ ] Configure build settings:
   - [ ] Build command: `npm run build`
   - [ ] Publish directory: `dist`
   - [ ] Production branch: `main`
7. [ ] Click "Deploy site"
8. [ ] Wait for build to complete

### Option B: Manual Drag & Drop

1. [ ] Build locally: `npm run build`
2. [ ] Go to https://app.netlify.com
3. [ ] Drag & drop the `dist` folder
4. [ ] Wait for deployment

## Environment Variables (Netlify)

After site creation:

1. [ ] Go to Site settings → Build & deploy → Environment
2. [ ] Add these variables:
   - [ ] `VITE_SUPABASE_URL`
   - [ ] `VITE_SUPABASE_SUPABASE_ANON_KEY`
3. [ ] Trigger a new deploy

## Post-Deployment Testing

### Homepage
- [ ] Page loads without errors
- [ ] All animations smooth
- [ ] Images display correctly
- [ ] Services section displays all 6 services
- [ ] Partners logos display
- [ ] Contact form appears

### Case Studies
- [ ] Case studies section loads
- [ ] Can see featured case studies
- [ ] "View All" button works
- [ ] Database connection working

### Podcasts
- [ ] Podcasts section loads
- [ ] Can see featured podcasts
- [ ] Play button appears
- [ ] Audio player works (if content added)

### Admin Panel
- [ ] `/login` page accessible
- [ ] Can login with admin credentials
- [ ] `/admin` dashboard loads
- [ ] Can create test case study
- [ ] Can create test podcast
- [ ] Changes appear on homepage in real-time

### Performance
- [ ] Page loads quickly (< 2s)
- [ ] No 404 errors
- [ ] Console clean (no errors)
- [ ] Lighthouse score > 90
- [ ] Mobile responsive works

### SEO
- [ ] Meta tags present
- [ ] Title and description correct
- [ ] Open Graph tags working
- [ ] Mobile viewport correct

## Custom Domain (Optional)

If you have a domain:

1. [ ] Buy domain (or use existing)
2. [ ] In Netlify → Site settings → Domain management
3. [ ] Add custom domain
4. [ ] Add DNS records to domain registrar
5. [ ] Wait for DNS propagation (up to 48 hours)
6. [ ] Enable auto HTTPS

## Backup & Monitoring

- [ ] Note Supabase credentials somewhere safe
- [ ] Note admin username/password securely
- [ ] Set up Netlify notifications
- [ ] Monitor Supabase dashboard

## Content Setup (After Deployment)

1. [ ] Login to `/admin`
2. [ ] Add first case study
   - [ ] Upload image
   - [ ] Add results
   - [ ] Mark as featured
3. [ ] Add first podcast
   - [ ] Upload cover image
   - [ ] Add audio URL
   - [ ] Set episode number
4. [ ] Verify content appears on homepage
5. [ ] Test admin panel fully

## Going Live

- [ ] All tests pass
- [ ] No errors on production
- [ ] Admin panel working
- [ ] Database secure
- [ ] Backups configured
- [ ] Team trained on admin usage

## Maintenance

- [ ] Regular backups (Supabase auto-backups)
- [ ] Monitor Netlify dashboard
- [ ] Update content regularly
- [ ] Check analytics
- [ ] Test forms monthly

---

## Troubleshooting During Deployment

**Build fails on Netlify**
- Check environment variables are set
- Check Node version (should be 20+)
- View Netlify build logs for errors

**Blank page after deploy**
- Check browser console for errors
- Verify environment variables
- Check Supabase connection

**Admin login not working**
- Verify Supabase credentials
- Check admin user exists
- Check user has admin role in metadata

**Content not showing**
- Verify data in Supabase
- Check RLS policies
- Test database query

---

**Estimated Time**: 30-45 minutes
**Difficulty**: Easy to Moderate
**Support**: Check SETUP.md and QUICK_START.md
