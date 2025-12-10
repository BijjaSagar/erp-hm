# 🔧 QUICK FIX: Vercel Environment Setup

## The Problem
Your app shows "Role: None" because **environment variables are missing in Vercel**.

---

## ✅ QUICK SOLUTION (3 Steps)

### Step 1: Go to Vercel Dashboard
Visit: **https://vercel.com/sagar-bijjas-projects/erp-hm/settings/environment-variables**

### Step 2: Add These 3 Variables

Click **"Add New"** for each variable:

#### Variable 1: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** 
```
postgresql://neondb_owner:npg_ABcgVsjy0i9l@ep-wandering-wave-ad4i4ii1-pooler.c-2.us-east-1.aws.neon.tech/hm-erp?sslmode=require
```
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

#### Variable 2: NEXTAUTH_URL
- **Name:** `NEXTAUTH_URL`
- **Value:** 
```
https://erp-hm.vercel.app
```
- **Environments:** ✅ Production only

#### Variable 3: NEXTAUTH_SECRET
- **Name:** `NEXTAUTH_SECRET`
- **Value:** 
```
3GhTXqeQmZWQbfL+0q1xqh7hTyLCJohir0rG+4EGuw8=
```
- **Environments:** ✅ Production, ✅ Preview, ✅ Development

### Step 3: Redeploy
1. Go to: https://vercel.com/sagar-bijjas-projects/erp-hm
2. Click **"Deployments"** tab
3. Click the **latest deployment**
4. Click **"Redeploy"** button
5. Click **"Redeploy"** to confirm

---

## 🎯 What This Fixes

After setting these variables and redeploying:

✅ Login will work properly  
✅ User roles will display correctly (not "Role: None")  
✅ All data will load from production database  
✅ Authentication will work on Vercel  

---

## 📸 Visual Guide

### Where to Add Variables:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Enter Name and Value
4. Select environments
5. Click "Save"

### After Adding All 3 Variables:
You should see:
- DATABASE_URL (Production, Preview, Development)
- NEXTAUTH_URL (Production)
- NEXTAUTH_SECRET (Production, Preview, Development)

---

## ⚠️ Important Notes

1. **NEXTAUTH_URL** should match your actual domain
   - If using custom domain: `https://your-domain.com`
   - If using Vercel domain: `https://erp-hm.vercel.app`

2. **Must Redeploy** after adding variables
   - Variables don't apply to existing deployments
   - You MUST trigger a new deployment

3. **Check Deployment Logs**
   - After redeployment, check logs for any errors
   - Look for "Build succeeded" message

---

## 🔍 Verify It's Working

After redeployment:

1. Visit: https://erp-8106fjwwv-sagar-bijjas-projects.vercel.app
2. Login with your credentials
3. Check if role displays correctly
4. Verify data loads properly

---

## 🆘 If Still Not Working

1. **Clear Browser Cache** and try again
2. **Check Vercel Logs:**
   - Go to Deployments → Click deployment → View Function Logs
3. **Verify Database Connection:**
   - Make sure Neon database is not paused
4. **Check Environment Variables:**
   - Make sure all 3 variables are set
   - Make sure they're in the correct environments

---

## 📞 Current Deployment

**Latest Production URL:**  
https://erp-8106fjwwv-sagar-bijjas-projects.vercel.app

**Vercel Project:**  
https://vercel.com/sagar-bijjas-projects/erp-hm

---

## ✅ Summary

**What to do:**
1. Add 3 environment variables in Vercel dashboard
2. Redeploy the application
3. Test login and verify role displays

**Time needed:** ~5 minutes

**This will fix:** The "Role: None" issue and make authentication work properly on Vercel.
