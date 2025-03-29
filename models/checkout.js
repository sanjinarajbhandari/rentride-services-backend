const { Schema, model, default: mongoose } = require("mongoose");

// Define a subdocument schema for the product
const product = new Schema({
  name: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

const checkoutSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    products: [product], // Embed array of products
  },
  { timestamps: true }
);

module.exports = model("Checkout", checkoutSchema);
