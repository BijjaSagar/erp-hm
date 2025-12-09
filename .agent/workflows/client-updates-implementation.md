---
description: Implementation plan for client-requested updates
---

# Client Updates Implementation Plan

## Overview
This document outlines the implementation plan for the client-requested changes from updates (1).pdf.

## 1. Marketing Head Panel (New Feature)

### Database Changes
- [ ] Add MARKETING_HEAD role to Role enum
- [ ] Create RawMaterial model for tracking raw materials
- [ ] Create Seller model for tracking suppliers
- [ ] Create RawMaterialPurchase model for purchase records
- [ ] Create RawMaterialUsage model for tracking consumption
- [ ] Create FinalProductSale model for sales records

### Backend Actions
- [ ] Create actions for raw material CRUD operations
- [ ] Create actions for seller CRUD operations
- [ ] Create actions for purchase management
- [ ] Create actions for usage tracking
- [ ] Create actions for sales management
- [ ] Create dashboard analytics for marketing head

### Frontend Pages
- [ ] Create Marketing Head dashboard (/dashboard/marketing)
- [ ] Create Raw Materials page with inventory tracking
- [ ] Create Sellers page for supplier management
- [ ] Create Purchases page for purchase records
- [ ] Create Usage page for consumption tracking
- [ ] Create Sales page for final product sales
- [ ] Add navigation menu items for Marketing Head role

## 2. Branch Name Changes

### Database Migration
- [ ] Update existing branch names: HM1, HM2, HP1, HP2
- [ ] Update branch codes accordingly

### Frontend Updates
- [ ] Verify all branch references display correctly
- [ ] Update any hardcoded branch names

## 3. Production Stage Addition

### Database Changes
- [ ] Add PLYWOOD_FITTING to ProductionStage enum (after PAINTING)
- [ ] Update production flow logic

### Frontend Updates
- [ ] Update production stage displays
- [ ] Update operator dashboard to include new stage
- [ ] Update order tracking to show new stage

## 4. Bug Fixes

### Orders Edit Option
- [ ] Debug and fix orders edit functionality
- [ ] Test edit form submission
- [ ] Verify data persistence

### Store Management Edit Option
- [ ] Debug and fix store management edit functionality
- [ ] Test edit form submission
- [ ] Verify data persistence

### Finances and Invoices Action (Eye Icon)
- [ ] Debug and fix invoice view action
- [ ] Test invoice detail display
- [ ] Verify data loading

### Employee Attendance Check Out Button
- [ ] Add check-out button to attendance interface
- [ ] Implement check-out functionality
- [ ] Update attendance records

### Employee Delete Button
- [ ] Add delete button to employee edit page
- [ ] Implement delete functionality with confirmation
- [ ] Handle cascading deletes properly

### Operator Production Session - Material Selection
- [ ] Debug material selection dropdown in end production session
- [ ] Fix material options visibility
- [ ] Test material consumption recording

### Operator Dashboard Quick Actions
- [ ] Debug and fix quick actions functionality
- [ ] Test all quick action buttons
- [ ] Verify navigation and actions

### Settings Option in Menu
- [ ] Debug and fix settings page
- [ ] Implement settings functionality
- [ ] Test settings persistence

## Implementation Order

1. **Phase 1: Critical Bug Fixes** (Immediate)
   - Fix Orders edit option
   - Fix Store management edit option
   - Fix Finances/Invoices view action
   - Fix Operator material selection issue
   - Fix Quick Actions
   - Fix Settings option

2. **Phase 2: Minor Enhancements** (Quick wins)
   - Add Employee check-out button
   - Add Employee delete button
   - Update branch names

3. **Phase 3: Production Stage Addition** (Medium priority)
   - Add PLYWOOD_FITTING stage
   - Update all related UI components

4. **Phase 4: Marketing Head Panel** (Major feature)
   - Database schema updates
   - Backend actions
   - Frontend pages and navigation
   - Testing and validation

## Testing Checklist

- [ ] All bug fixes verified and working
- [ ] Branch names updated correctly
- [ ] New production stage flows correctly
- [ ] Marketing Head panel fully functional
- [ ] All CRUD operations working
- [ ] Data persistence verified
- [ ] User permissions working correctly
- [ ] Navigation and routing working
- [ ] No console errors
- [ ] Database migrations successful
