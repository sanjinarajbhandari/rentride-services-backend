const Vehicle = require("../models/vehicleModel");
const errorHandler = require("../middlewares/error-handler");

let uploadedFilename;

exports.uploadVehicleImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a file" });
    }

    const filename = req.file.filename;

    uploadedFilename = filename;

    res.status(200).json({ success: true, data: filename });
  } catch (error) {
    next(error);
  }
};

exports.createVehicle = async (req, res, next) => {
  const { brand, model, power, Fuel, price, type, description } = req.body;

  const image = uploadedFilename || "";

  try {
    if (
      !brand ||
      !model ||
      !power ||
      !Fuel ||
      !price ||
      !type ||
      !description
    ) {
      return res.status(400).json({ error: "Please fill in all fields" });
    }

    const vehicleData = {
      brand,
      model,
      power,
      Fuel,
      price,
      type,
      description,
      image,
    };

    const vechicle = await Vehicle.create(vehicleData);
    res.status(201).json(vechicle);
  } catch (error) {
    next(error);
  } finally {
    uploadedFilename = undefined;
  }
};

exports.getVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.find();

    if (!vehicle) {
      return errorHandler("No Vehicle added yet.", 404);
    }
    // Send response
    res.status(200).json({
      message: "Vehicle fetched successfully.",
      vehicle: vehicle,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    // Fetch the vehicle
    const vehicleId = req.params.vehicleId;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      // If vehicle not found, send a 404 response
      return res.status(404).json({ message: "Could not find vehicle." });
    }

    // Remove the vehicle
    await Vehicle.findOneAndDelete({ _id: vehicleId });

    // Send response
    res.status(200).json({ message: "Vehicle deleted." });
  } catch (err) {
    // Handle other errors
    console.error("Error deleting vehicle:", err);
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// Update a Vehicle
exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicleIdToUpdate = req.params.vehicleId;
    const updatedVehicle = await Vehicle.findOneAndUpdate(
      { _id: vehicleIdToUpdate },
      req.body,
      { new: true }
    );

    if (!updatedVehicle)
      return res.status(404).json({ error: "Vehicle not found" });

    return res.status(201).json(updatedVehicle);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

//Review
exports.addReview = async (req, res, next) => {
  try {
    const vehicleExists = await Vehicle.findById(req.body.vehicleId);
    if (!vehicleExists) {
      const error = new Error("Vehicle not found");
      error.statusCode = 404;
      throw error;
    }

    await Vehicle.updateOne(
      { _id: req.body.vehicleId },
      { $push: { review: req.body.review } }
    );
    res.status(200).json({
      message: "Review has been set.",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
