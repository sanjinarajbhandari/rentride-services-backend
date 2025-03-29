const Vehicle = require("../controllers/vehicle");
const uploads = require("../middlewares/uploads");
const express = require("express");
const router = express.Router();

// ADD
router.post("/createVehicle", Vehicle.createVehicle);
router.post("/uploadVehicleImage", uploads, Vehicle.uploadVehicleImage);
router.post("/addReviewV", Vehicle.addReview);

// Fetch all Vehicle
router.get("/admin/getVehicle", Vehicle.getVehicle);
router.get("/getVehicle", Vehicle.getVehicle);

router.put("/admin/vehicle/:vehicleId", Vehicle.updateVehicle);

// Remove a product
router.delete("/Vehicle/:vehicleId", Vehicle.deleteVehicle);

module.exports = router;
