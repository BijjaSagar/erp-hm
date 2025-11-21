# Vercel Deployment Guide for HM-ERP

## Prerequisites

### 1. Database Setup
You need a production PostgreSQL database. Options:
- **Vercel Postgres** (recommended, easiest integration)
- **Supabase** (free tier available)
- **Railway** (free tier available)
- **Neon** (serverless Postgres, free tier)

### 2. Environment Variables Required
```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
```

## Deployment Steps

### Option 1: Deploy with Vercel (Recommended)

#### Step 1: Initialize Git Repository
```bash
cd /Users/akash/Downloads/HM-ERP
git init
git add .
git commit -m "Initial commit - HM-ERP application"
```

#### Step 2: Push to GitHub
1. Create a new repository on GitHub
2. Push your code:
```bash
git remote add origin https://github.com/YOUR_USERNAME/hm-erp.git
git branch -M main
git push -u origin main
```

#### Step 3: Set Up Database

**Option A: Vercel Postgres (Easiest)**
1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Copy the `DATABASE_URL` connection string

**Option B: Supabase (Free Tier)**
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database → Connection String
4. Copy the connection string

#### Step 4: Deploy to Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL`: Your database connection string
   - `NEXTAUTH_URL`: https://your-app.vercel.app (will be provided after first deploy)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
5. Click "Deploy"

#### Step 5: Run Database Migrations
After first deployment:
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
npx prisma db seed
```

Or use Vercel's build command:
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && next build"
  }
}
```

### Option 2: Deploy with Netlify

#### Step 1: Add netlify.toml
```toml
[build]
  command = "prisma generate && prisma migrate deploy && npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Step 2: Deploy
1. Push code to GitHub
2. Go to https://netlify.com
3. Import repository
4. Add environment variables
5. Deploy

### Option 3: Deploy with Railway

1. Go to https://railway.app
2. Create new project from GitHub repo
3. Add PostgreSQL database (automatic)
4. Add environment variables
5. Deploy

## Post-Deployment

### 1. Seed Production Database
```bash
# Connect to production
vercel env pull
npx tsx scripts/seed-complete-test-data.ts
```

### 2. Test Credentials
All operators: `password123`
- cutting@test.com
- shaping@test.com
- bending@test.com
- welding-inner@test.com
- welding-outer@test.com
- grinding@test.com
- finishing@test.com
- painting@test.com

### 3. Update NEXTAUTH_URL
After first deploy, update the `NEXTAUTH_URL` environment variable to your actual Vercel URL.

## Troubleshooting

### Build Errors
- Ensure all dependencies are in `package.json`
- Check that `prisma generate` runs before build
- Verify DATABASE_URL is set correctly

### Database Connection Issues
- Check DATABASE_URL format
- Ensure database allows external connections
- Verify SSL settings (add `?sslmode=require` if needed)

### Authentication Issues
- Verify NEXTAUTH_SECRET is set
- Check NEXTAUTH_URL matches your domain
- Ensure cookies are allowed

## Quick Deploy Commands

```bash
# Generate secret
openssl rand -base64 32

# Initialize git
git init
git add .
git commit -m "Initial commit"

# Deploy to Vercel
vercel --prod

# Run migrations on Vercel
vercel env pull
npx prisma migrate deploy
npx tsx scripts/seed-complete-test-data.ts
```

## Important Notes

1. **Database**: Local SQLite won't work in production - you MUST use PostgreSQL
2. **Environment Variables**: Never commit `.env` file to Git
3. **Migrations**: Run `prisma migrate deploy` not `prisma migrate dev` in production
4. **Seeding**: Only seed test data in development/staging, not production
5. **HTTPS**: Vercel automatically provides HTTPS

## Cost Considerations

- **Vercel**: Free for hobby projects, $20/month for Pro
- **Vercel Postgres**: Free tier: 256MB storage, 60 hours compute
- **Supabase**: Free tier: 500MB database, 2GB bandwidth
- **Railway**: $5/month credit, pay-as-you-go after

## Next Steps After Deployment

1. Set up custom domain (optional)
2. Configure production environment variables
3. Remove test data and create real users
4. Set up monitoring and error tracking (Sentry)
5. Configure backup strategy for database
6. Set up CI/CD for automatic deployments
