---
description: Deploy code and database changes to production server
---

# Deploy to Production

This workflow will push your code changes to GitHub and deploy them to Vercel with database migrations.

## Steps

### 1. Check current status
```bash
git status
```

### 2. Add all changes to git
// turbo
```bash
git add .
```

### 3. Commit changes with descriptive message
```bash
git commit -m "Fix: Remove .tsx extension from import and add production entry features"
```

### 4. Push to GitHub (this will trigger Vercel deployment)
```bash
git push origin main
```

### 5. Check if Vercel CLI is installed
```bash
vercel --version
```

### 6. If not installed, install Vercel CLI
```bash
npm install -g vercel
```

### 7. Login to Vercel (if not already logged in)
```bash
vercel login
```

### 8. Link to your Vercel project (if not already linked)
```bash
vercel link --yes
```

### 9. Pull production environment variables
```bash
vercel env pull .env.production.local
```

### 10. Deploy database migrations to production
```bash
npx prisma migrate deploy
```

### 11. Trigger production deployment
```bash
vercel --prod
```

### 12. Check deployment status
```bash
vercel ls
```

## Post-Deployment Verification

1. Visit your production URL: https://erp-hm.vercel.app
2. Test the login functionality
3. Navigate to Production → Orders → Start Production Entry
4. Verify the import error is fixed
5. Test the production entry flow

## Troubleshooting

If migrations fail:
```bash
# Check migration status
npx prisma migrate status

# Reset and reapply (CAUTION: Only in development)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

If deployment fails:
- Check Vercel dashboard for build logs
- Verify environment variables are set correctly
- Ensure DATABASE_URL is accessible from Vercel
