const express = require("express");
const router = express.Router();
const PricingController = require("../controllers/pricing.controller");

/**
 * Production-Grade Pricing Routes
 * All advanced pricing business logic endpoints
 */

// ============================================================================
// PRICE CALCULATION ENDPOINTS
// ============================================================================

/**
 * @route   POST /api/pricing/calculate
 * @desc    Calculate price with all applicable discounts
 * @access  Public
 * @body    { productId, quantity, customerId }
 */
router.post("/calculate", PricingController.calculatePrice);

/**
 * @route   POST /api/pricing/calculate-bundle
 * @desc    Calculate bundle pricing for multiple products
 * @access  Public
 * @body    { items: [{ productId, quantity, customerId }] }
 */
router.post("/calculate-bundle", PricingController.calculateBundlePrice);

/**
 * @route   POST /api/pricing/compare
 * @desc    Compare our price with competitors
 * @access  Public
 * @body    { productId, competitorPrices: [{ name, price }] }
 */
router.post("/compare", PricingController.compareCompetitors);

// ============================================================================
// PRICING RULES MANAGEMENT ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/pricing/rules
 * @desc    Get all pricing rules with optional filters
 * @access  Public
 * @query   rule_type, is_active
 */
router.get("/rules", PricingController.getAllPricingRules);

/**
 * @route   POST /api/pricing/rules
 * @desc    Create new pricing rule
 * @access  Admin
 * @body    { rule_name, rule_type, product_id, category_id, discount_percentage, ... }
 */
router.post("/rules", PricingController.createPricingRule);

/**
 * @route   PUT /api/pricing/rules/:id
 * @desc    Update pricing rule
 * @access  Admin
 * @body    { rule_name, discount_percentage, is_active, ... }
 */
router.put("/rules/:id", PricingController.updatePricingRule);

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/pricing/history/:productId
 * @desc    Get price history for a product
 * @access  Public
 * @query   days (default: 30)
 */
router.get("/history/:productId", PricingController.getPriceHistory);

module.exports = router;
