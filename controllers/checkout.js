const Checkout = require("../models/checkout");
const errorHandler = require("../middlewares/error-handler");
const multer = require("multer");
const Vehicle = require("../models/vehicleModel");
const sendCheckoutMail = require("../utlis/mail");

exports.createCheckout = async (req, res, next) => {
  try {
    const cart = req.body.cart;

    console.log(req.body.cart, "body");

    const checkout = new Checkout({
      email: req.body.email,
    });

    cart.forEach((item) => {
      checkout.products.push({
        name: item.name,
        brand: item.brand,
        productId: item._id,
        quantity: item.quantity,
      });
    });

    // Save the checkout to the database
    await checkout.save();

    sendCheckoutMail(req.body.cart, req.body.email);

    // Send response
    return res.status(201).json({ message: "Checkout Created", checkout });
  } catch (error) {
    next(error);
  }
};

exports.fetchCheckout = async (req, res, next) => {
  try {
    //Fetch all products
    const Checkouts = await Checkout.find();

    if (!Checkouts) {
      return errorHandler("No checkout done yet.", 404);
    }
    // Send response
    res.status(200).json({
      message: "Checkout fetched successfully.",
      Checkouts: Checkouts,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
