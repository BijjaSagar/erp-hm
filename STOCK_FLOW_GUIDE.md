# Stock & Inventory Flow - Complete Guide

## 🎯 Overview

Your ERP system has a complete stock management flow from production to retail stores. Here's how it works:

## 📊 Stock Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRODUCTION UNIT                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Order      │ →  │  Production  │ →  │   Completed  │      │
│  │  (APPROVED)  │    │ (IN_PROGRESS)│    │   (READY)    │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                                ↓
                    ┌───────────────────────┐
                    │   STOCK TRANSFER      │
                    │  (PRODUCTION → STORE) │
                    │                       │
                    │  Status Flow:         │
                    │  PENDING              │
                    │     ↓                 │
                    │  IN_TRANSIT           │
                    │     ↓                 │
                    │  RECEIVED             │
                    └───────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      STORE INVENTORY                             │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  Product: Chair Model X                              │       │
│  │  SKU: CHR-001                                         │       │
│  │  Quantity: 50 units                                   │       │
│  │  Cost Price: ₹500                                     │       │
│  │  Selling Price: ₹750                                  │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
                                ↓
┌─────────────────────────────────────────────────────────────────┐
│                      POS SALES                                   │
│  Customer purchases → Inventory decreases                        │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Detailed Process Flow

### Step 1: Production Completion

**When an order is completed in production:**

```typescript
// Order status changes to COMPLETED
order.status = "COMPLETED"
order.currentStage = "COMPLETED"

// ProductionEntry is marked complete
productionEntry.endTime = new Date()
productionEntry.outputQuantity = 50 // units produced
```

**What you see:**
- Order appears in "Completed Orders" list
- Ready for stock transfer

---

### Step 2: Create Stock Transfer

**Admin/Manager creates a stock transfer:**

```typescript
// Create Stock Transfer
const stockTransfer = {
  transferNumber: "ST-2024-001",
  fromType: "PRODUCTION",        // From production unit
  fromBranchId: "branch-123",    // Production branch
  toStoreId: "store-456",        // Destination store
  orderId: "order-789",          // Link to completed order
  status: "PENDING",
  transferredBy: "admin-id",
  items: [
    {
      productName: "Chair Model X",
      sku: "CHR-001",
      quantity: 50,
      unit: "pieces",
      costPrice: 500,
      sellingPrice: 750
    }
  ]
}
```

**Status Flow:**
1. **PENDING**: Transfer created, awaiting dispatch
2. **IN_TRANSIT**: Goods dispatched from production
3. **RECEIVED**: Goods received at store

---

### Step 3: Store Receives Stock

**When store manager marks transfer as RECEIVED:**

```typescript
// Update transfer status
stockTransfer.status = "RECEIVED"
stockTransfer.receivedBy = "store-manager-id"
stockTransfer.receivedAt = new Date()

// Automatically update Store Inventory
for (const item of stockTransfer.items) {
  // Check if product exists in store inventory
  const existing = await prisma.storeInventory.findUnique({
    where: {
      storeId_sku: {
        storeId: stockTransfer.toStoreId,
        sku: item.sku
      }
    }
  })
  
  if (existing) {
    // Update existing inventory
    await prisma.storeInventory.update({
      where: { id: existing.id },
      data: {
        quantity: existing.quantity + item.quantity
      }
    })
  } else {
    // Create new inventory record
    await prisma.storeInventory.create({
      data: {
        storeId: stockTransfer.toStoreId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unit: item.unit,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice
      }
    })
  }
}
```

---

### Step 4: POS Sales

**When a customer makes a purchase:**

```typescript
// POS Transaction
const transaction = {
  storeId: "store-456",
  items: [
    {
      sku: "CHR-001",
      quantity: 2,
      price: 750
    }
  ]
}

// Reduce inventory
await prisma.storeInventory.update({
  where: {
    storeId_sku: {
      storeId: "store-456",
      sku: "CHR-001"
    }
  },
  data: {
    quantity: { decrement: 2 }  // 50 - 2 = 48 remaining
  }
})
```

---

## 🎨 UI Workflow

### For Production Manager:

1. **View Completed Orders**
   - Navigate to Production → Completed Orders
   - See list of orders ready for transfer

2. **Create Stock Transfer**
   - Click "Transfer to Store" button
   - Select destination store
   - Review items and quantities
   - Submit transfer (status: PENDING)

3. **Track Transfer**
   - View transfer status
   - Mark as IN_TRANSIT when dispatched

### For Store Manager:

1. **View Incoming Transfers**
   - Navigate to Store → Stock Transfers
   - See list of PENDING and IN_TRANSIT transfers

2. **Receive Stock**
   - Click "Receive" on transfer
   - Verify items and quantities
   - Confirm receipt (status: RECEIVED)
   - Inventory automatically updated

3. **View Inventory**
   - Navigate to Store → Inventory
   - See all products with current stock levels

### For POS Operator:

1. **Make Sale**
   - Select products from available inventory
   - Process payment
   - Inventory automatically decreases

---

## 📋 Database Models

### StoreInventory
```prisma
model StoreInventory {
  id              String   @id @default(cuid())
  storeId         String
  productName     String
  sku             String
  quantity        Int      // Current stock level
  unit            String
  costPrice       Float
  sellingPrice    Float
  reorderLevel    Int?     // Alert when stock is low
  
  store           Store    @relation(...)
  
  @@unique([storeId, sku])  // One record per product per store
}
```

### StockTransfer
```prisma
model StockTransfer {
  id              String              @id
  transferNumber  String              @unique
  fromType        TransferSourceType  // PRODUCTION or STORE
  fromBranchId    String?             // If from production
  fromStoreId     String?             // If from another store
  toStoreId       String              // Destination store
  status          TransferStatus      // PENDING/IN_TRANSIT/RECEIVED
  orderId         String?             // Link to production order
  transferredBy   String              // Who created transfer
  receivedBy      String?             // Who received it
  transferredAt   DateTime
  receivedAt      DateTime?
  
  items           StockTransferItem[]
}
```

### StockTransferItem
```prisma
model StockTransferItem {
  id              String
  transferId      String
  productName     String
  sku             String
  quantity        Int
  unit            String
  costPrice       Float
  sellingPrice    Float
  
  transfer        StockTransfer @relation(...)
}
```

---

## 🔐 Access Control

**Who can do what:**

| Action | ADMIN | PRODUCTION_SUPERVISOR | STORE_MANAGER | OPERATOR |
|--------|-------|----------------------|---------------|----------|
| Create Transfer from Production | ✅ | ✅ | ❌ | ❌ |
| View Transfers | ✅ | ✅ | ✅ (own store) | ❌ |
| Receive Transfer | ✅ | ❌ | ✅ (own store) | ❌ |
| View Store Inventory | ✅ | ❌ | ✅ (own store) | ❌ |
| Make POS Sale | ✅ | ❌ | ✅ | ❌ |

---

## 📊 Reports & Analytics

### Inventory Reports:
- Current stock levels per store
- Low stock alerts (below reorder level)
- Stock movement history
- Transfer history

### Production to Store Tracking:
- Orders awaiting transfer
- Transfers in transit
- Transfer completion rate
- Average transfer time

---

## 🚀 Next Steps to Implement

### 1. Stock Transfer UI
Create pages for:
- `/dashboard/stock-transfers` - List all transfers
- `/dashboard/stock-transfers/new` - Create new transfer
- `/dashboard/stock-transfers/[id]` - View/manage transfer

### 2. Inventory Management UI
Create pages for:
- `/dashboard/stores/[id]/inventory` - View store inventory
- `/dashboard/inventory/reports` - Inventory reports

### 3. Automation
- Auto-create transfer when order completes
- Auto-update inventory when transfer received
- Low stock alerts
- Reorder suggestions

---

## ✅ Summary

Your system already has all the database models needed! The flow is:

1. **Production completes order** → Order status = COMPLETED
2. **Create StockTransfer** → fromType = PRODUCTION, status = PENDING
3. **Dispatch goods** → status = IN_TRANSIT
4. **Store receives** → status = RECEIVED, inventory auto-updates
5. **POS sales** → inventory decreases automatically

The infrastructure is ready - you just need to build the UI pages for managing transfers and viewing inventory!
