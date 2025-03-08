const { Schema, model, default: mongoose } = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    contact: {
      type: Number,
      required: true,
    },

    checkOutDate: {
      type: Date,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },
    image: {
      type: [String],
      required: true,
    },

    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Booking", bookingSchema);
