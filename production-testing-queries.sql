-- Production Flow Testing - SQL Queries
-- Run these queries to verify data integrity and test the production flow

-- ============================================
-- 1. CHECK CURRENT STATE OF ALL ORDERS
-- ============================================

-- View all orders with their current stage and status
SELECT 
    "orderNumber",
    "customerName",
    "status",
    "currentStage",
    "createdAt",
    "updatedAt"
FROM "Order"
ORDER BY "createdAt" DESC;

-- ============================================
-- 2. COUNT ORDERS BY STAGE AND STATUS
-- ============================================

-- This should match what you see on the production dashboard
SELECT 
    "currentStage",
    "status",
    COUNT(*) as order_count
FROM "Order"
GROUP BY "currentStage", "status"
ORDER BY "currentStage";

-- ============================================
-- 3. VERIFY PENDING STAGE COUNTS
-- ============================================

-- Orders that should appear in PENDING column
SELECT 
    "orderNumber",
    "customerName",
    "status",
    "currentStage"
FROM "Order"
WHERE "currentStage" = 'PENDING'
  AND "status" IN ('PENDING', 'APPROVED');

-- ============================================
-- 4. VERIFY COMPLETED STAGE COUNTS
-- ============================================

-- Orders that should appear in COMPLETED column
SELECT 
    "orderNumber",
    "customerName",
    "status",
    "currentStage"
FROM "Order"
WHERE "currentStage" = 'COMPLETED'
  AND "status" IN ('COMPLETED', 'DELIVERED');

-- ============================================
-- 5. VIEW PRODUCTION LOGS FOR AN ORDER
-- ============================================

-- Replace 'ORD260104001' with your actual order number
SELECT 
    o."orderNumber",
    pl."stage",
    pl."status",
    pl."timestamp",
    e."name" as employee_name,
    e."designation",
    pl."notes"
FROM "ProductionLog" pl
JOIN "Order" o ON pl."orderId" = o."id"
LEFT JOIN "Employee" e ON pl."employeeId" = e."id"
WHERE o."orderNumber" = 'ORD260104001'
ORDER BY pl."timestamp" ASC;

-- ============================================
-- 6. VIEW ALL PRODUCTION LOGS (RECENT)
-- ============================================

-- See the last 50 production log entries
SELECT 
    o."orderNumber",
    pl."stage",
    pl."status",
    pl."timestamp",
    e."name" as employee_name,
    pl."notes"
FROM "ProductionLog" pl
JOIN "Order" o ON pl."orderId" = o."id"
LEFT JOIN "Employee" e ON pl."employeeId" = e."id"
ORDER BY pl."timestamp" DESC
LIMIT 50;

-- ============================================
-- 7. ORDERS IN EACH PRODUCTION STAGE
-- ============================================

-- PENDING
SELECT COUNT(*) as pending_count FROM "Order" 
WHERE "currentStage" = 'PENDING' AND "status" IN ('PENDING', 'APPROVED');

-- CUTTING
SELECT COUNT(*) as cutting_count FROM "Order" 
WHERE "currentStage" = 'CUTTING' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- SHAPING
SELECT COUNT(*) as shaping_count FROM "Order" 
WHERE "currentStage" = 'SHAPING' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- BENDING
SELECT COUNT(*) as bending_count FROM "Order" 
WHERE "currentStage" = 'BENDING' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- WELDING_INNER
SELECT COUNT(*) as welding_inner_count FROM "Order" 
WHERE "currentStage" = 'WELDING_INNER' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- WELDING_OUTER
SELECT COUNT(*) as welding_outer_count FROM "Order" 
WHERE "currentStage" = 'WELDING_OUTER' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- GRINDING
SELECT COUNT(*) as grinding_count FROM "Order" 
WHERE "currentStage" = 'GRINDING' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- FINISHING
SELECT COUNT(*) as finishing_count FROM "Order" 
WHERE "currentStage" = 'FINISHING' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- PAINTING
SELECT COUNT(*) as painting_count FROM "Order" 
WHERE "currentStage" = 'PAINTING' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- PLYWOOD_FITTING
SELECT COUNT(*) as plywood_fitting_count FROM "Order" 
WHERE "currentStage" = 'PLYWOOD_FITTING' AND "status" IN ('APPROVED', 'IN_PRODUCTION');

-- COMPLETED
SELECT COUNT(*) as completed_count FROM "Order" 
WHERE "currentStage" = 'COMPLETED' AND "status" IN ('COMPLETED', 'DELIVERED');

-- ============================================
-- 8. COMPREHENSIVE STAGE SUMMARY
-- ============================================

-- All stages with counts in one query
SELECT 
    'PENDING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'PENDING' AND "status" IN ('PENDING', 'APPROVED')

UNION ALL

SELECT 
    'CUTTING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'CUTTING' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'SHAPING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'SHAPING' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'BENDING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'BENDING' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'WELDING_INNER' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'WELDING_INNER' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'WELDING_OUTER' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'WELDING_OUTER' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'GRINDING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'GRINDING' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'FINISHING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'FINISHING' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'PAINTING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'PAINTING' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'PLYWOOD_FITTING' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'PLYWOOD_FITTING' AND "status" IN ('APPROVED', 'IN_PRODUCTION')

UNION ALL

SELECT 
    'COMPLETED' as stage,
    COUNT(*) as count
FROM "Order" 
WHERE "currentStage" = 'COMPLETED' AND "status" IN ('COMPLETED', 'DELIVERED');

-- ============================================
-- 9. FIND ORDERS WITH PRODUCTION HISTORY
-- ============================================

-- Orders that have moved through multiple stages
SELECT 
    o."orderNumber",
    o."customerName",
    o."currentStage",
    COUNT(pl."id") as stage_changes
FROM "Order" o
LEFT JOIN "ProductionLog" pl ON o."id" = pl."orderId"
GROUP BY o."id", o."orderNumber", o."customerName", o."currentStage"
HAVING COUNT(pl."id") > 0
ORDER BY stage_changes DESC;

-- ============================================
-- 10. ORDERS WITHOUT PRODUCTION LOGS
-- ============================================

-- Orders that haven't been updated yet
SELECT 
    o."orderNumber",
    o."customerName",
    o."currentStage",
    o."status",
    o."createdAt"
FROM "Order" o
LEFT JOIN "ProductionLog" pl ON o."id" = pl."orderId"
WHERE pl."id" IS NULL
ORDER BY o."createdAt" DESC;

-- ============================================
-- 11. PRODUCTION TIMELINE FOR AN ORDER
-- ============================================

-- Replace 'ORD260104001' with your order number
-- Shows the complete journey of an order through stages
SELECT 
    pl."stage",
    pl."status",
    pl."timestamp",
    e."name" as employee,
    pl."notes",
    LAG(pl."timestamp") OVER (ORDER BY pl."timestamp") as previous_timestamp,
    EXTRACT(EPOCH FROM (pl."timestamp" - LAG(pl."timestamp") OVER (ORDER BY pl."timestamp")))/3600 as hours_in_previous_stage
FROM "ProductionLog" pl
LEFT JOIN "Employee" e ON pl."employeeId" = e."id"
WHERE pl."orderId" = (SELECT "id" FROM "Order" WHERE "orderNumber" = 'ORD260104001')
ORDER BY pl."timestamp" ASC;

-- ============================================
-- 12. AVERAGE TIME PER STAGE (ACROSS ALL ORDERS)
-- ============================================

-- Calculate average time spent in each stage
WITH stage_durations AS (
    SELECT 
        pl."orderId",
        pl."stage",
        pl."timestamp",
        LEAD(pl."timestamp") OVER (PARTITION BY pl."orderId" ORDER BY pl."timestamp") as next_timestamp
    FROM "ProductionLog" pl
)
SELECT 
    "stage",
    COUNT(*) as times_completed,
    AVG(EXTRACT(EPOCH FROM (next_timestamp - "timestamp"))/3600) as avg_hours,
    MIN(EXTRACT(EPOCH FROM (next_timestamp - "timestamp"))/3600) as min_hours,
    MAX(EXTRACT(EPOCH FROM (next_timestamp - "timestamp"))/3600) as max_hours
FROM stage_durations
WHERE next_timestamp IS NOT NULL
GROUP BY "stage"
ORDER BY "stage";

-- ============================================
-- 13. MOST ACTIVE EMPLOYEES IN PRODUCTION
-- ============================================

-- See which employees are updating production most
SELECT 
    e."name",
    e."designation",
    COUNT(pl."id") as updates_made,
    COUNT(DISTINCT pl."orderId") as orders_worked_on,
    MIN(pl."timestamp") as first_update,
    MAX(pl."timestamp") as last_update
FROM "ProductionLog" pl
JOIN "Employee" e ON pl."employeeId" = e."id"
GROUP BY e."id", e."name", e."designation"
ORDER BY updates_made DESC;

-- ============================================
-- 14. ORDERS STUCK IN A STAGE
-- ============================================

-- Find orders that haven't been updated in over 24 hours
SELECT 
    o."orderNumber",
    o."customerName",
    o."currentStage",
    o."updatedAt",
    EXTRACT(EPOCH FROM (NOW() - o."updatedAt"))/3600 as hours_since_update
FROM "Order" o
WHERE o."status" NOT IN ('COMPLETED', 'DELIVERED', 'CANCELLED')
  AND o."updatedAt" < NOW() - INTERVAL '24 hours'
ORDER BY o."updatedAt" ASC;

-- ============================================
-- 15. CREATE TEST ORDER (FOR TESTING)
-- ============================================

-- Insert a test order to verify the flow
-- Note: You'll need to replace 'your-branch-id' with an actual branch ID
/*
INSERT INTO "Order" ("id", "orderNumber", "customerName", "customerPhone", "customerAddress", "status", "currentStage", "branchId", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    'TEST001',
    'Test Customer',
    '1234567890',
    'Test Address',
    'PENDING',
    'PENDING',
    'your-branch-id',
    NOW(),
    NOW()
);

-- Add an item to the test order
INSERT INTO "OrderItem" ("id", "orderId", "productName", "quantity", "dimensions", "material", "createdAt", "updatedAt")
VALUES (
    gen_random_uuid(),
    (SELECT "id" FROM "Order" WHERE "orderNumber" = 'TEST001'),
    'Test Product',
    1,
    '10x10x10',
    'Steel',
    NOW(),
    NOW()
);
*/

-- ============================================
-- 16. CLEANUP TEST DATA (AFTER TESTING)
-- ============================================

-- Delete test order and related data
/*
DELETE FROM "ProductionLog" WHERE "orderId" = (SELECT "id" FROM "Order" WHERE "orderNumber" = 'TEST001');
DELETE FROM "OrderItem" WHERE "orderId" = (SELECT "id" FROM "Order" WHERE "orderNumber" = 'TEST001');
DELETE FROM "Order" WHERE "orderNumber" = 'TEST001';
*/

-- ============================================
-- NOTES:
-- ============================================
-- 1. These queries match the logic in getProductionStats()
-- 2. The counts should match what you see on the dashboard
-- 3. Use these to verify data integrity after updates
-- 4. Replace placeholder values (like order numbers) with actual data
