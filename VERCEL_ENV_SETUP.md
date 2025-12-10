# 🔧 Fix Vercel Environment Variables

## Issue
The app is showing "Role: None" because the environment variables are not properly configured in Vercel.

---

## ✅ Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/sagar-bijjas-projects/erp-hm
2. Click on **Settings** tab
3. Click on **Environment Variables** in the left sidebar

### Step 2: Add These Environment Variables

Add the following variables for **Production, Preview, and Development**:

#### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_ABcgVsjy0i9l@ep-wandering-wave-ad4i4ii1-pooler.c-2.us-east-1.aws.neon.tech/hm-erp?sslmode=require
```

#### 2. NEXTAUTH_URL
```
https://erp-hm.vercel.app
```
*(Or your actual Vercel domain)*

#### 3. NEXTAUTH_SECRET
Generate a new secret:
```bash
# Run this command locally to generate:
openssl rand -base64 32
```
Then paste the output as the value.

Example output:
```
Kix2f3...your-random-string...9xK=
```

---

## Step 3: Redeploy

After adding the environment variables:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Select **Use existing Build Cache** (optional)
5. Click **Redeploy**

---

## Alternative: Use Vercel CLI

You can also set environment variables using the CLI:

```bash
# Set DATABASE_URL
vercel env add DATABASE_URL production

# Set NEXTAUTH_URL  
vercel env add NEXTAUTH_URL production

# Set NEXTAUTH_SECRET
vercel env add NEXTAUTH_SECRET production
```

When prompted, paste the values.

---

## 🎯 Expected Environment Variables

Your Vercel project should have these 3 environment variables:

| Variable | Value | Environments |
|----------|-------|--------------|
| DATABASE_URL | postgresql://neondb_owner:... | Production, Preview, Development |
| NEXTAUTH_URL | https://erp-hm.vercel.app | Production |
| NEXTAUTH_SECRET | (random 32-char string) | Production, Preview, Development |

---

## ✅ After Setup

Once environment variables are set and redeployed:

1. ✅ Login will work properly
2. ✅ User roles will display correctly
3. ✅ All data will be from production database
4. ✅ No more "Role: None" issue

---

## 📝 Notes

- **NEXTAUTH_URL** must match your production domain
- **NEXTAUTH_SECRET** should be a strong random string
- All variables should be set for **Production** environment
- After adding variables, you MUST redeploy for changes to take effect

---

## 🔍 Verify Setup

After redeployment, check:
1. Login page loads
2. Can login with credentials
3. Dashboard shows correct role
4. Data loads from database

If issues persist, check Vercel deployment logs for errors.
