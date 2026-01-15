# Production Entry System - Implementation Plan

## Overview
Implement comprehensive production tracking using the ProductionEntry model to track time, quantities, material consumption, and operator efficiency.

## Features to Implement

### 1. Time Tracking
- Start time when operator begins work on a stage
- End time when stage is completed
- Auto-calculate duration
- Track idle time and breaks

### 2. Quantity Tracking
- Input quantity (units received from previous stage)
- Output quantity (units successfully produced)
- Rejected quantity (defective units)
- Wastage quantity (scrap material)
- Auto-calculate efficiency percentage

### 3. Material Consumption
- Track materials used per stage
- Link to inventory items
- Record quantity consumed
- Track wastage
- Update inventory automatically

### 4. Machine Assignment
- Assign specific machines to production tasks
- Track machine utilization
- Record machine performance

### 5. Quality Control
- Quality notes per stage
- Approval workflow
- Supervisor sign-off
- Rejection reasons

## Database Schema (Already Exists)

```prisma
model ProductionEntry {
  id                String          @id @default(cuid())
  orderId           String
  machineId         String
  operatorId        String
  stage             ProductionStage
  
  inputQuantity     Int
  outputQuantity    Int
  rejectedQuantity  Int             @default(0)
  wastageQuantity   Float           @default(0)
  wastagePercentage Float?
  
  startTime         DateTime        @default(now())
  endTime           DateTime?
  duration          Int?            // Minutes
  
  materialsUsed     Json?
  qualityNotes      String?
  qualityApproved   Boolean         @default(false)
  approvedBy        String?
  approvedAt        DateTime?
  
  order             Order
  machine           Machine
  operator          Employee
  approver          Employee?
  materialConsumptions MaterialConsumption[]
}
```

## Implementation Steps

### Phase 1: Core Production Entry Actions
1. Create production entry actions
2. Start production entry (operator begins work)
3. Update production entry (record progress)
4. Complete production entry (finish stage)

### Phase 2: UI Components
1. Production entry form
2. Material consumption tracker
3. Quality check interface
4. Real-time production monitor

### Phase 3: Integration
1. Link with existing production flow
2. Update production page to use entries
3. Add operator dashboard
4. Add supervisor approval workflow

### Phase 4: Reporting
1. Production efficiency reports
2. Material consumption reports
3. Operator performance metrics
4. Machine utilization reports

## Files to Create/Modify

### New Files:
- `src/actions/production-entry.ts`
- `src/actions/material-consumption.ts`
- `src/app/dashboard/production/[orderId]/start/page.tsx`
- `src/app/dashboard/production/[orderId]/start/start-form.tsx`
- `src/app/dashboard/production/[orderId]/complete/page.tsx`
- `src/app/dashboard/production/[orderId]/complete/complete-form.tsx`
- `src/app/dashboard/operator/production-entry-card.tsx`
- `src/components/production/material-consumption-form.tsx`
- `src/components/production/quality-check-form.tsx`

### Modified Files:
- `src/app/dashboard/production/page.tsx`
- `src/app/dashboard/production/[orderId]/update/update-form.tsx`
- `src/actions/production.ts`

## API Endpoints

### Production Entry
- `createProductionEntry()` - Start work on a stage
- `updateProductionEntry()` - Update progress
- `completeProductionEntry()` - Finish stage
- `getProductionEntriesByOrder()` - Get all entries for an order
- `getActiveProductionEntries()` - Get ongoing work

### Material Consumption
- `recordMaterialConsumption()` - Record material usage
- `getMaterialConsumptionByEntry()` - Get materials for an entry
- `updateInventoryFromConsumption()` - Deduct from inventory

## User Workflows

### Operator Workflow:
1. View assigned orders
2. Start production entry (select machine, input quantity)
3. Record material consumption during work
4. Complete entry (record output, rejected, wastage)
5. Submit for quality approval

### Supervisor Workflow:
1. View pending approvals
2. Review production entry details
3. Check quality
4. Approve or reject
5. Move order to next stage

## Success Metrics

- ✅ Time tracking per stage
- ✅ Quantity tracking (input/output/rejected)
- ✅ Material consumption recorded
- ✅ Inventory auto-updated
- ✅ Efficiency metrics calculated
- ✅ Quality approval workflow
- ✅ Real-time production monitoring
