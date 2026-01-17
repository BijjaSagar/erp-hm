# Client-Side Exception Fix - SelectItem Empty Value Error

## Issue Description
The application was showing a client-side exception error:
```
Error: A <Select.Item /> must have a value prop that is not an empty string.
```

This error was occurring because Radix UI's Select component (which is used by the shadcn/ui Select component) does not allow `SelectItem` components to have empty string values (`value=""`).

## Root Cause
Two files had `SelectItem` components with empty string values:
1. `/src/app/dashboard/orders/[id]/edit/form.tsx` - Line 112
2. `/src/app/dashboard/stores/[id]/edit/form.tsx` - Line 127

Both were using:
```tsx
<SelectItem value="">None</SelectItem>
```

## Solution Applied

### Frontend Changes
Changed the empty string values to `"none"`:

**File: `/src/app/dashboard/orders/[id]/edit/form.tsx`**
```tsx
// Before
<SelectItem value="">None</SelectItem>

// After
<SelectItem value="none">None</SelectItem>
```

**File: `/src/app/dashboard/stores/[id]/edit/form.tsx`**
```tsx
// Before
<SelectItem value="">None</SelectItem>

// After
<SelectItem value="none">None</SelectItem>
```

### Backend Changes
Updated the server actions to properly handle the "none" value by treating it as `null`:

**File: `/src/actions/order.ts`**
- Line 65: Updated validation to check for "none"
- Line 79: Ensured null is stored in database
- Line 197: Updated update function to handle "none"

**File: `/src/actions/store.ts`**
- Lines 92, 138: Updated validation to check for "none"
- Lines 113, 161: Ensured null is stored in database

The logic now converts "none" to `null` before saving to the database:
```typescript
branchId: branchId && branchId !== "none" ? branchId : null
managerId: managerId && managerId !== "none" ? managerId : null
```

## Files Modified
1. `/src/app/dashboard/orders/[id]/edit/form.tsx`
2. `/src/app/dashboard/stores/[id]/edit/form.tsx`
3. `/src/actions/order.ts`
4. `/src/actions/store.ts`

## Testing
The development server has been restarted and is running successfully on `http://localhost:3000`.

To verify the fix:
1. Navigate to an order edit page
2. Try selecting "None" for the branch field
3. Navigate to a store edit page
4. Try selecting "None" for the manager field
5. Verify no console errors appear

## Status
✅ **FIXED** - The application should now load without the client-side exception error.
