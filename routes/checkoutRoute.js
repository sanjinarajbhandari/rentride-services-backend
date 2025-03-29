const express = require("express");
const router = express.Router();
const Checkout = require("../controllers/checkout");
const validateToken = require("../middlewares/validateToken");
// Example route definition
router.post("/createCheckout", validateToken("user"), Checkout.createCheckout);
router.get("/fetchCheckout", Checkout.fetchCheckout);
router.get(
  "/fetchCheckoutadmin",
  validateToken("admin"),
  Checkout.fetchCheckout
);

module.exports = router;
