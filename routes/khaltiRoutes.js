const express = require("express");
const router = express.Router();
const khaltiController = require("../controllers/khaltiController");

// post req to khalti api
router.post("/khaltiApi", khaltiController.khaltiApi);
router.post("/khaltiSuccess", khaltiController.khaltiSuccess);

module.exports = router;
