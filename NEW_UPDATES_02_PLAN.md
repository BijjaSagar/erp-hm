# New Updates 02 - Implementation Plan

## Changes Required

### 1. Sidebar Navigation Updates ✅
- [x] Remove "Bills" from MARKETING_HEAD
- [x] Add "Bills" to ADMIN
- [x] Remove "Product Sales" from BRANCH_MANAGER (keep only for ADMIN)
- [x] Add Production features to BRANCH_MANAGER:
  - [x] Production
  - [x] Operator Dashboard
  - [x] Production Reports
  - [x] Stock

### 2. Fix 404 Errors - Pages to Create

#### ADMIN - Accounting
- [ ] `/dashboard/accounting/pl-report` - P&L Report page
- [ ] `/dashboard/accounting/tax-reports` - Tax Reports page

#### ADMIN - Raw Materials
- [x] `/dashboard/raw-materials/new` - Already exists
- [ ] Need to verify it works

#### ADMIN - Sellers
- [x] `/dashboard/sellers/new` - Already exists
- [x] `/dashboard/sellers/[id]/edit` - Already exists
- [ ] Need to verify they work

#### ADMIN - Purchases
- [x] `/dashboard/purchases/new` - Already exists
- [ ] Need to verify it works

#### ADMIN - Material Usage
- [x] `/dashboard/usage/new` - Already exists
- [ ] Need to verify it works

#### ADMIN - Product Sales
- [x] `/dashboard/sales/new` - Already exists
- [ ] Need to verify it works

#### MARKETING - Customers
- [ ] `/dashboard/marketing/customers/new` - Add Customer form

## Implementation Steps

1. ✅ Update sidebar navigation
2. Create missing pages for 404 errors
3. Verify all existing pages work
4. Test the application
5. Push to GitHub
6. Deploy to Vercel
