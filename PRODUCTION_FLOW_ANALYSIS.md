# Production Flow Analysis & Issues Found

## Date: 2026-01-15

## Overview
This document analyzes the production tracking flow in the HM-ERP system, identifies issues, and provides solutions.

---

## Current Flow Architecture

### 1. **Order Creation Flow**
```
User creates order → Order saved with:
  - status: PENDING
  - currentStage: PENDING
  - orderNumber: Auto-generated (ORD + YYMM + sequence)
  - items: Array of products
```

### 2. **Production Update Flow**
```
Production Page → Select Order → Update Stage Form → Submit
  ↓
updateProductionStage() action:
  1. Updates Order.currentStage
  2. Updates Order.status (IN_PRODUCTION or COMPLETED)
  3. Creates ProductionLog entry
  4. Revalidates cache
```

### 3. **Data Display Flow**
```
Production Page:
  - Fetches orders grouped by stage
  - Displays in Kanban board
  - Shows stats per stage

Order Detail Page:
  - Shows production progress
  - Lists production logs with history
```

---

## Database Schema Analysis

### Order Model
```prisma
model Order {
  id              String          @id @default(cuid())
  orderNumber     String          @unique
  customerName    String
  status          OrderStatus     @default(PENDING)
  currentStage    ProductionStage @default(PENDING)
  branchId        String?
  
  items           OrderItem[]
  productionLogs  ProductionLog[]
  // ... other relations
}
```

### ProductionLog Model
```prisma
model ProductionLog {
  id         String          @id @default(cuid())
  orderId    String
  stage      ProductionStage
  status     String
  employeeId String?
  notes      String?
  timestamp  DateTime        @default(now())
  
  employee   Employee?       @relation(fields: [employeeId], references: [id])
  order      Order           @relation(fields: [orderId], references: [id])
}
```

---

## Issues Identified

### ❌ **CRITICAL ISSUE #1: Missing Production Stats Filter**

**Location:** `src/actions/production.ts` - `getProductionStats()`

**Problem:**
```typescript
// Lines 145-151
const count = await prisma.order.count({
    where: {
        currentStage: stage,
        status: {
            in: ["APPROVED", "IN_PRODUCTION"],
        },
    },
});
```

**Issue:** The stats query filters for `APPROVED` and `IN_PRODUCTION` statuses, but:
- Orders with status `PENDING` won't be counted in the PENDING stage
- Orders with status `COMPLETED` won't be counted in the COMPLETED stage

**Impact:** 
- Dashboard shows incorrect counts
- PENDING stage will always show 0
- COMPLETED stage will always show 0

---

### ❌ **CRITICAL ISSUE #2: Incomplete Production Log Data**

**Location:** `src/app/dashboard/production/[orderId]/update/update-form.tsx`

**Problem:**
The form doesn't capture all necessary production data:
- ✅ Stage (captured)
- ✅ Employee (captured)
- ✅ Notes (captured)
- ✅ Status (captured)
- ❌ Start time (not captured)
- ❌ End time (not captured)
- ❌ Duration (not calculated)
- ❌ Input/Output quantities (not tracked)
- ❌ Wastage (not tracked)
- ❌ Material consumption (not tracked)

**Impact:**
- Cannot track production efficiency
- Cannot calculate time per stage
- Cannot track material usage
- Cannot identify bottlenecks

---

### ⚠️ **ISSUE #3: No Validation for Stage Progression**

**Location:** `src/actions/production.ts` - `updateProductionStage()`

**Problem:**
```typescript
// Lines 107-115
await prisma.order.update({
    where: { id: orderId },
    data: {
        currentStage: stage,
        status: stage === ProductionStage.COMPLETED
            ? "COMPLETED"
            : "IN_PRODUCTION",
    },
});
```

**Issue:**
- No validation that stages are updated in sequence
- User can skip stages (e.g., PENDING → COMPLETED)
- User can go backwards (e.g., PAINTING → CUTTING)

**Impact:**
- Data integrity issues
- Inaccurate production tracking
- Confusion in workflow

---

### ⚠️ **ISSUE #4: Missing Production Entry Integration**

**Database has `ProductionEntry` model but it's not being used!**

**Location:** Schema defines this model (lines 328-364) but no code uses it

```prisma
model ProductionEntry {
  id                String          @id @default(cuid())
  orderId           String
  machineId         String
  operatorId        String
  stage             ProductionStage
  
  inputQuantity     Int
  outputQuantity    Int
  rejectedQuantity  Int
  wastageQuantity   Float
  
  startTime         DateTime
  endTime           DateTime?
  duration          Int?
  
  materialsUsed     Json?
  qualityNotes      String?
  qualityApproved   Boolean
  // ...
}
```

**Impact:**
- Rich production tracking features are not utilized
- Cannot track machine-wise production
- Cannot track operator efficiency
- Cannot track quality metrics

---

### ⚠️ **ISSUE #5: No Real-time Production Tracking**

**Problem:**
- Production logs are created only when stage is completed
- No way to track ongoing work
- No way to see which operator is working on which order

**Impact:**
- Cannot monitor real-time production status
- Cannot identify delays early
- Cannot reassign work dynamically

---

## Data Flow Verification

### ✅ **What's Working:**

1. **Order Creation**
   - Orders are created successfully
   - Order numbers are generated correctly
   - Items are saved properly

2. **Stage Updates**
   - Orders can be moved between stages
   - Production logs are created
   - Status is updated correctly

3. **Data Retrieval**
   - Orders are fetched and grouped by stage
   - Production logs are displayed on order detail page
   - Kanban board shows orders correctly

### ❌ **What's Broken:**

1. **Statistics**
   - PENDING stage count is incorrect
   - COMPLETED stage count is incorrect
   - Only IN_PRODUCTION and APPROVED orders are counted

2. **Production Tracking**
   - No time tracking
   - No quantity tracking
   - No material consumption tracking
   - No wastage tracking

3. **Data Integrity**
   - No stage sequence validation
   - Can skip stages
   - Can go backwards

---

## Recommended Fixes

### **FIX #1: Correct Production Stats Query**

**File:** `src/actions/production.ts`

**Change:**
```typescript
export async function getProductionStats() {
    try {
        const stages = Object.values(ProductionStage);
        const stats: Record<string, number> = {};

        for (const stage of stages) {
            // Define status filter based on stage
            let statusFilter;
            
            if (stage === ProductionStage.PENDING) {
                statusFilter = { in: ["PENDING", "APPROVED"] };
            } else if (stage === ProductionStage.COMPLETED) {
                statusFilter = { in: ["COMPLETED"] };
            } else {
                statusFilter = { in: ["APPROVED", "IN_PRODUCTION"] };
            }

            const count = await prisma.order.count({
                where: {
                    currentStage: stage,
                    status: statusFilter,
                },
            });
            stats[stage] = count;
        }

        return stats;
    } catch (error) {
        console.error("Error fetching production stats:", error);
        return {};
    }
}
```

### **FIX #2: Add Stage Sequence Validation**

**File:** `src/actions/production.ts`

**Add before updating order:**
```typescript
// Validate stage progression
const stages = Object.values(ProductionStage);
const currentStageIndex = stages.indexOf(order.currentStage);
const newStageIndex = stages.indexOf(stage);

if (newStageIndex < currentStageIndex) {
    return { message: "Cannot move to a previous stage" };
}

if (newStageIndex - currentStageIndex > 1) {
    return { message: "Cannot skip stages. Please update to the next stage in sequence." };
}
```

### **FIX #3: Integrate ProductionEntry Model**

**Create new action:** `src/actions/production-entry.ts`

This would handle:
- Creating production entries when operator starts work
- Tracking input/output quantities
- Recording start/end times
- Calculating efficiency metrics

### **FIX #4: Add Material Consumption Tracking**

**Enhance update form to include:**
- Material selection
- Quantity consumed
- Wastage recording
- Quality checks

---

## Testing Checklist

### Manual Testing Steps:

1. **Create a new order**
   - [ ] Verify order is created with PENDING status
   - [ ] Verify order appears in PENDING column
   - [ ] Verify PENDING count increases

2. **Update to CUTTING stage**
   - [ ] Verify order moves to CUTTING column
   - [ ] Verify production log is created
   - [ ] Verify status changes to IN_PRODUCTION
   - [ ] Verify CUTTING count increases
   - [ ] Verify PENDING count decreases

3. **Progress through all stages**
   - [ ] Verify each stage transition works
   - [ ] Verify production logs are created
   - [ ] Verify counts update correctly

4. **Complete the order**
   - [ ] Verify order moves to COMPLETED column
   - [ ] Verify status changes to COMPLETED
   - [ ] Verify COMPLETED count increases

5. **View order details**
   - [ ] Verify production history is displayed
   - [ ] Verify all logs show correct information
   - [ ] Verify employee names are shown

6. **Test edge cases**
   - [ ] Try to skip stages (should be prevented after fix)
   - [ ] Try to go backwards (should be prevented after fix)
   - [ ] Create multiple orders and verify counts

---

## Database Queries for Manual Verification

### Check order counts by stage:
```sql
SELECT "currentStage", "status", COUNT(*) 
FROM "Order" 
GROUP BY "currentStage", "status";
```

### Check production logs:
```sql
SELECT o."orderNumber", pl."stage", pl."status", pl."timestamp", e."name"
FROM "ProductionLog" pl
JOIN "Order" o ON pl."orderId" = o."id"
LEFT JOIN "Employee" e ON pl."employeeId" = e."id"
ORDER BY pl."timestamp" DESC;
```

### Check orders in each stage:
```sql
SELECT "currentStage", "orderNumber", "customerName", "status"
FROM "Order"
ORDER BY "currentStage", "createdAt" DESC;
```

---

## Conclusion

### Summary of Issues:
1. ❌ **CRITICAL:** Production stats query excludes PENDING and COMPLETED orders
2. ❌ **CRITICAL:** No time/quantity/material tracking
3. ⚠️ **HIGH:** No stage sequence validation
4. ⚠️ **MEDIUM:** ProductionEntry model not utilized
5. ⚠️ **MEDIUM:** No real-time tracking

### Immediate Actions Required:
1. Fix production stats query (5 minutes)
2. Add stage validation (10 minutes)
3. Test complete flow manually (15 minutes)

### Future Enhancements:
1. Integrate ProductionEntry model for detailed tracking
2. Add material consumption tracking
3. Add real-time production monitoring
4. Add operator efficiency reports
5. Add quality control checkpoints
