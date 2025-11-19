# Role Permissions Analysis - Inventory Management System

**Analysis Date:** November 19, 2025  
**Purpose:** Verify logical role separation and identify inappropriate permissions

---

## 🔍 SUPPLIER ROLE - Current Permissions

### ✅ **LOGICAL Permissions (Suppliers SHOULD have these)**

#### 1. **Supplier Profile Management** ✅
- **Route:** `/supplier-profile`
- **Actions:** View and update own profile
- **Backend:** `GET/PUT /api/suppliers/profile/me`
- **Why Logical:** Suppliers need to manage their own business information
- **Status:** ✅ Correct

#### 2. **Rate Products** ✅
- **Route:** `/product-ratings`
- **Actions:** Rate products they supply, view their ratings
- **Backend:** `POST /api/products/:productId/rate`, `GET /api/products/my-ratings`
- **Why Logical:** Suppliers can provide feedback on products they supply (quality, demand, etc.)
- **Status:** ✅ Correct

#### 3. **View Purchase Orders** ✅
- **Route:** `/purchase-orders`
- **Actions:** View purchase orders related to their supplies
- **Backend:** `GET /api/purchase-orders`
- **Why Logical:** Suppliers need to see orders placed with them for fulfillment
- **Status:** ✅ Correct (view-only appropriate)

#### 4. **Dashboard Access** ✅
- **Route:** `/dashboard/supplier`
- **Actions:** View their supply metrics, pending orders, performance
- **Why Logical:** Suppliers need visibility into their business relationship
- **Status:** ✅ Correct

---

### ❌ **ILLOGICAL Permissions (Suppliers SHOULD NOT have these)**

#### 1. **View ALL Products (Read-Only)** ⚠️ **QUESTIONABLE**
- **Route:** `/products`
- **Current Access:** Yes (read-only)
- **Problem:** 
  - Suppliers can see entire product catalog including competitors' products
  - Can see internal product details (cost, margins, inventory levels)
  - Business intelligence leak
- **Recommendation:** 
  - **Option A:** Remove completely - suppliers don't need to browse inventory
  - **Option B:** Restrict to only products they supply
  - **Option C:** Limit data shown (hide costs, margins, stock levels)
- **Status:** ❌ **NEEDS REVIEW**

#### 2. **Access Pricing Calculator** ❌ **ILLOGICAL**
- **Route:** `/products/pricing`
- **Current Access:** Yes (can calculate prices)
- **Problem:**
  - Pricing calculator shows internal pricing logic, margins, discounts
  - Suppliers can reverse-engineer company's pricing strategy
  - Can see competitor pricing if multiple suppliers supply same products
  - **This is a major business intelligence leak**
- **Recommendation:** **REMOVE IMMEDIATELY**
- **Rationale:** Suppliers should receive purchase orders with agreed prices, not calculate internal pricing
- **Status:** ❌ **REMOVE ACCESS**

#### 3. **View Purchase Orders (Full Access)** ⚠️ **PARTIAL ISSUE**
- **Route:** `/purchase-orders`
- **Current Access:** Can view, but checks `canManagePO` in component
- **Problem:**
  - If not filtered properly, suppliers could see orders from other suppliers
  - Could see total purchase volumes, pricing comparisons
- **Recommendation:**
  - Backend must filter to only show orders for that specific supplier
  - Frontend should be read-only for suppliers (no create/edit/delete)
- **Status:** ⚠️ **NEEDS BACKEND VERIFICATION**

---

## 📊 SUPPLIER Role Summary

| Feature | Current Access | Should Have | Action Needed |
|---------|---------------|-------------|---------------|
| Supplier Profile | ✅ Full | ✅ Yes | None |
| Rate Products | ✅ Full | ✅ Yes | None |
| View Own POs | ✅ Yes | ✅ Yes | Verify backend filtering |
| Dashboard | ✅ Yes | ✅ Yes | None |
| **View All Products** | ✅ Read-Only | ❌ No | **Remove or restrict** |
| **Pricing Calculator** | ✅ Full | ❌ No | **Remove access** |
| Purchase Order CRUD | ❌ No | ❌ No | Correct |
| Inventory Management | ❌ No | ❌ No | Correct |
| Product Approval | ❌ No | ❌ No | Correct |
| User Management | ❌ No | ❌ No | Correct |

---

## 🎯 Recommended Changes for SUPPLIER Role

### **High Priority (Security/Business Risk)**

1. **REMOVE Pricing Calculator Access** 🚨
   ```javascript
   // Remove from: frontend/src/App.jsx
   allowedRoles={["admin", "warehouse_staff"]} // Remove "supplier"
   
   // Remove from: frontend/src/components/layout/Sidebar.jsx
   roles: ["admin", "warehouse_staff"] // Remove "supplier"
   ```

2. **REMOVE or RESTRICT Product List Access** ⚠️
   ```javascript
   // Option A: Remove completely
   allowedRoles={["admin", "warehouse_staff"]} // Remove "supplier"
   
   // Option B: Create separate "SupplierProductView" page
   // - Shows only products they supply
   // - Hides cost/margin information
   // - Shows only stock status (not quantities)
   ```

### **Medium Priority (Data Filtering)**

3. **Verify Purchase Orders Backend Filtering**
   - Ensure suppliers only see their own purchase orders
   - Add supplier_id filter at database level
   - Frontend should be read-only for suppliers

---

## 📋 Next Steps

1. ✅ **Review this analysis** - Confirm which permissions are truly needed
2. ⏳ **Apply Supplier fixes** - Remove/restrict inappropriate access
3. ⏳ **Analyze Warehouse Staff role** - Check their permissions
4. ⏳ **Analyze Admin role** - Verify admin has appropriate full access
5. ⏳ **Update documentation** - Document final role matrix
6. ⏳ **Test role separation** - Verify each role can only access what they should

---

## 🔐 Business Logic Principles

**Key Principle:** *Suppliers are external entities, not internal staff*

- ✅ Suppliers manage their own profile
- ✅ Suppliers see orders for their supplies
- ✅ Suppliers can rate/feedback on products
- ❌ Suppliers should NOT see internal pricing logic
- ❌ Suppliers should NOT see entire inventory catalog
- ❌ Suppliers should NOT see other suppliers' data
- ❌ Suppliers should NOT create/modify purchase orders (company creates them)

