const { Schema, model, default: mongoose } = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    power: {
      type: String,
      required: true,
    },
    Fuel: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    review: {
      type: [String],
    },
    price: {
      type: Number,
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Vehicle", vehicleSchema);
