---
description: Implementation plan for client-requested updates
---

# Client Updates Implementation Plan

Based on the PDF requirements, here are the changes needed:

## Overview
- Production partner manages HP1 and HP2 branches
- Partner adds 9% margin to production cost
- HP1 products → HM1 with 9% margin
- HP2 products → HM2 with 9% margin
- Coloring and plywood fitting done at HM1 (client's cost)
- Partner = Manager role

## 1. MARKETING_HEAD Role Updates

### Remove from Marketing Panel:
- Raw materials
- Sellers
- Purchases
- Material usage
- Product sales

### Keep in Marketing Panel:
- Marketing Dashboard
- Orders
- Customers (Party's)
- Finished Goods (Stock)
- Bills

### Features:
- View all finished goods (completed stock)
- View customer (party) data
- Partial payment reminders for Marketing Head and Admin

## 2. ADMIN Role Updates

### Add to Admin Panel (moved from Marketing):
- Raw Materials
- Sellers
- Purchases
- Material usage
- Product sales

### New Features:
- POS Contra Entry for banking cheques

## 3. BRANCH_MANAGER Role Updates

### Menu Items:
- Dashboard
- Employees
- Raw Materials
- Sellers
- Material usage
- Product sales
- Production
  - Operator dashboard
  - Production reports
  - Stock

## Implementation Steps

### Step 1: Update Sidebar Routes
- Remove marketing routes: raw-materials, sellers, purchases, usage, sales
- Add these routes to ADMIN role
- Add these routes to BRANCH_MANAGER role
- Add "Customers" and "Finished Goods" to MARKETING_HEAD
- Add "Bills" to MARKETING_HEAD

### Step 2: Create New Pages
- `/dashboard/marketing/customers` - Customer (Party) management
- `/dashboard/marketing/finished-goods` - Completed stock view
- `/dashboard/marketing/bills` - Bills management
- `/dashboard/pos/contra-entry` - Contra entry for banking cheques

### Step 3: Update Existing Pages
- Move marketing raw-materials, sellers, purchases, usage, sales to admin/manager access
- Add partial payment reminder system

### Step 4: Database Updates
- Add Customer/Party model if not exists
- Add Bills model
- Add ContraEntry model for POS
- Add payment reminder tracking

### Step 5: Create Server Actions
- Customer CRUD operations
- Finished goods queries
- Bills management
- Contra entry operations
- Payment reminder queries
