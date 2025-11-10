const express = require("express");
const router = express.Router();
const ProductLifecycleController = require("../controllers/productLifecycle.controller");

/**
 * Production-Grade Product Lifecycle Routes
 * All lifecycle management and approval workflow endpoints
 */

// ============================================================================
// PRODUCT LIFECYCLE CREATION & TRANSITIONS
// ============================================================================

/**
 * @route   POST /api/products/lifecycle
 * @desc    Create new product with lifecycle management (starts in DRAFT)
 * @access  Public
 * @body    { name, category_id, unit_price, sku, ... }
 */
router.post("/lifecycle", ProductLifecycleController.createProduct);

/**
 * @route   POST /api/products/:id/transition
 * @desc    Transition product to new lifecycle state
 * @access  Admin
 * @body    { newState, notes, userId }
 */
router.post("/:id/transition", ProductLifecycleController.transitionState);

// ============================================================================
// APPROVAL WORKFLOW ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/products/pending-approvals
 * @desc    Get all products pending approval
 * @access  Admin
 */
router.get("/pending-approvals", ProductLifecycleController.getPendingApprovals);

/**
 * @route   POST /api/products/:id/submit-for-approval
 * @desc    Submit product for approval (draft → pending_approval)
 * @access  Public
 * @body    { userId, notes }
 */
router.post("/:id/submit-for-approval", ProductLifecycleController.submitForApproval);

/**
 * @route   POST /api/products/:id/approve
 * @desc    Approve product (pending_approval → approved)
 * @access  Admin
 * @body    { userId, notes }
 */
router.post("/:id/approve", ProductLifecycleController.approveProduct);

/**
 * @route   POST /api/products/bulk-approve
 * @desc    Bulk approve multiple products
 * @access  Admin
 * @body    { productIds: [1, 2, 3], userId, notes }
 */
router.post("/bulk-approve", ProductLifecycleController.bulkApprove);

// ============================================================================
// STATE MANAGEMENT SHORTCUTS
// ============================================================================

/**
 * @route   POST /api/products/:id/activate
 * @desc    Activate product (make available for sale)
 * @access  Admin
 * @body    { userId, notes }
 */
router.post("/:id/activate", ProductLifecycleController.activateProduct);

/**
 * @route   POST /api/products/:id/discontinue
 * @desc    Discontinue product (stop selling)
 * @access  Admin
 * @body    { userId, notes }
 */
router.post("/:id/discontinue", ProductLifecycleController.discontinueProduct);

/**
 * @route   POST /api/products/:id/archive
 * @desc    Archive product (permanently remove from active catalog)
 * @access  Admin
 * @body    { userId, notes }
 */
router.post("/:id/archive", ProductLifecycleController.archiveProduct);

// ============================================================================
// LIFECYCLE QUERY ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/products/by-state/:state
 * @desc    Get all products in a specific lifecycle state
 * @access  Public
 * @query   category_id
 * @params  state (draft, pending_approval, approved, active, discontinued, archived)
 */
router.get("/by-state/:state", ProductLifecycleController.getProductsByState);

/**
 * @route   GET /api/products/:id/lifecycle-history
 * @desc    Get lifecycle history for a product
 * @access  Public
 * @query   limit (default: 50)
 */
router.get("/:id/lifecycle-history", ProductLifecycleController.getLifecycleHistory);

/**
 * @route   GET /api/products/lifecycle-stats
 * @desc    Get statistics for product lifecycle states
 * @access  Admin
 */
router.get("/lifecycle-stats", ProductLifecycleController.getLifecycleStats);

module.exports = router;
