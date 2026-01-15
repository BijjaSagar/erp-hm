# Production Flow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ORDER LIFECYCLE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────┐
                              │ ORDER CREATED│
                              │ Status: PENDING
                              │ Stage: PENDING
                              └──────┬───────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │  PRODUCTION DASHBOARD          │
                    │  Shows all orders by stage     │
                    │  ✅ PENDING count now correct  │
                    └────────────────┬───────────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │ UPDATE STAGE CLICKED  │
                         └───────────┬───────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │  STAGE VALIDATION (NEW!)       │
                    │  ✅ Check not backwards        │
                    │  ✅ Check not skipping         │
                    └────────┬───────────────────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
            ┌──────────────┐   ┌──────────────┐
            │   VALID      │   │   INVALID    │
            │   Continue   │   │   Show Error │
            └──────┬───────┘   └──────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  UPDATE ORDER            │
        │  - currentStage = new    │
        │  - status = IN_PRODUCTION│
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  CREATE PRODUCTION LOG   │
        │  - stage                 │
        │  - employee              │
        │  - notes                 │
        │  - timestamp             │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  REVALIDATE CACHE        │
        │  - Production page       │
        │  - Orders page           │
        │  - Order detail page     │
        └──────────┬───────────────┘
                   │
                   ▼
        ┌──────────────────────────┐
        │  REDIRECT TO PRODUCTION  │
        │  ✅ Counts updated       │
        │  ✅ Order moved to new   │
        │     stage column         │
        └──────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION STAGES FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

  PENDING → CUTTING → SHAPING → BENDING → WELDING_INNER → WELDING_OUTER
     ↓         ↓         ↓         ↓            ↓               ↓
  [Count]  [Count]   [Count]   [Count]      [Count]         [Count]
     ↓         ↓         ↓         ↓            ↓               ↓
     └─────────┴─────────┴─────────┴────────────┴───────────────┘
                                  ↓
                    GRINDING → FINISHING → PAINTING → PLYWOOD_FITTING → COMPLETED
                        ↓          ↓          ↓             ↓               ↓
                    [Count]    [Count]    [Count]       [Count]         [Count]
                        ↓          ↓          ↓             ↓               ↓
                        └──────────┴──────────┴─────────────┴───────────────┘

  ✅ Can only move forward (left to right)
  ✅ Cannot skip stages
  ✅ Cannot go backwards


┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATABASE SCHEMA                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐
│      Order       │
├──────────────────┤
│ id               │◄─────────┐
│ orderNumber      │          │
│ customerName     │          │
│ status           │          │ One-to-Many
│ currentStage     │          │
│ branchId         │          │
│ createdAt        │          │
│ updatedAt        │          │
└──────────────────┘          │
                              │
                    ┌─────────┴──────────┐
                    │                    │
                    │                    │
        ┌───────────▼────────┐   ┌──────▼──────────┐
        │   ProductionLog    │   │   OrderItem     │
        ├────────────────────┤   ├─────────────────┤
        │ id                 │   │ id              │
        │ orderId            │   │ orderId         │
        │ stage              │   │ productName     │
        │ status             │   │ quantity        │
        │ employeeId         │   │ dimensions      │
        │ notes              │   │ material        │
        │ timestamp          │   └─────────────────┘
        └────────┬───────────┘
                 │
                 │ Many-to-One
                 │
        ┌────────▼───────────┐
        │     Employee       │
        ├────────────────────┤
        │ id                 │
        │ name               │
        │ designation        │
        │ department         │
        │ assignedStages     │
        └────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                     DATA FLOW - BEFORE vs AFTER                              │
└─────────────────────────────────────────────────────────────────────────────┘

BEFORE (BROKEN):
═══════════════

getProductionStats()
    ↓
    Query: WHERE currentStage = 'PENDING' AND status IN ('APPROVED', 'IN_PRODUCTION')
    ↓
    Result: 0 orders (because PENDING orders have status 'PENDING', not 'APPROVED')
    ↓
    Dashboard shows: PENDING = 0 ❌


AFTER (FIXED):
═════════════

getProductionStats()
    ↓
    Check stage type:
    - If PENDING → status IN ('PENDING', 'APPROVED')
    - If COMPLETED → status IN ('COMPLETED', 'DELIVERED')
    - Else → status IN ('APPROVED', 'IN_PRODUCTION')
    ↓
    Query: WHERE currentStage = 'PENDING' AND status IN ('PENDING', 'APPROVED')
    ↓
    Result: Actual count of pending orders
    ↓
    Dashboard shows: PENDING = 5 ✅


┌─────────────────────────────────────────────────────────────────────────────┐
│                      VALIDATION LOGIC                                        │
└─────────────────────────────────────────────────────────────────────────────┘

Example: Order currently at CUTTING stage (index 1)

Scenario 1: Try to update to SHAPING (index 2)
    currentStageIndex = 1
    newStageIndex = 2
    newStageIndex - currentStageIndex = 1
    ✅ ALLOWED (next stage in sequence)

Scenario 2: Try to update to PAINTING (index 8)
    currentStageIndex = 1
    newStageIndex = 8
    newStageIndex - currentStageIndex = 7 (> 1)
    ❌ REJECTED: "Cannot skip stages. Please update to the next stage in sequence."

Scenario 3: Try to update to PENDING (index 0)
    currentStageIndex = 1
    newStageIndex = 0
    newStageIndex < currentStageIndex
    ❌ REJECTED: "Cannot move to a previous stage"


┌─────────────────────────────────────────────────────────────────────────────┐
│                    KANBAN BOARD LAYOUT                                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────┬─────────┬─────────┬─────────┬──────────┬──────────┬─────────┐
│ PENDING │ CUTTING │ SHAPING │ BENDING │ WELDING  │ WELDING  │GRINDING │
│   (5)   │   (3)   │   (2)   │   (1)   │  INNER   │  OUTER   │   (4)   │
├─────────┼─────────┼─────────┼─────────┤   (2)    │   (1)    ├─────────┤
│ ORD001  │ ORD006  │ ORD009  │ ORD012  ├──────────┼──────────┤ ORD016  │
│ ORD002  │ ORD007  │ ORD010  │         │ ORD013   │ ORD015   │ ORD017  │
│ ORD003  │ ORD008  │         │         │ ORD014   │          │ ORD018  │
│ ORD004  │         │         │         │          │          │ ORD019  │
│ ORD005  │         │         │         │          │          │         │
└─────────┴─────────┴─────────┴─────────┴──────────┴──────────┴─────────┘

┌──────────┬─────────┬──────────────┬──────────┐
│FINISHING │ PAINTING│ PLYWOOD      │COMPLETED │
│   (2)    │   (3)   │ FITTING (1)  │   (8)    │
├──────────┼─────────┼──────────────┼──────────┤
│ ORD020   │ ORD023  │ ORD026       │ ORD027   │
│ ORD021   │ ORD024  │              │ ORD028   │
│          │ ORD025  │              │ ORD029   │
│          │         │              │ ORD030   │
│          │         │              │ ORD031   │
│          │         │              │ ORD032   │
│          │         │              │ ORD033   │
│          │         │              │ ORD034   │
└──────────┴─────────┴──────────────┴──────────┘

Each card shows:
- Order Number
- Customer Name
- Item Count
- Branch Code
- Update Stage button
```
