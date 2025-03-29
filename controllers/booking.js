const Booking = require("../models/bookingModel");
const errorHandler = require("../middlewares/error-handler");
const Vehicle = require("../models/vehicleModel");
const jwt = require("jsonwebtoken");

const sendBookingMail = require("../utlis/mail");

exports.createBooking = async (req, res, next) => {
  const accessTokenCookie = req.cookies["access_Token"];

  let decodedToken;
  if (accessTokenCookie) {
    decodedToken = jwt.verify(accessTokenCookie, process.env.JWT_SECRET);
  }

  const userEmail = decodedToken.email;

  try {
    const booking = await Booking.create(req.body);
    await Vehicle.updateOne(
      {
        _id: req.body.vehicleId,
      },
      {
        $set: { availability: false },
      }
    );

    sendBookingMail(userEmail, req.body);

    return res.status(201).json({ message: "Booking Created", booking });
  } catch (error) {
    next(error);
  }
};

exports.fetchBooking = async (req, res, next) => {
  try {
    const Bookings = await Booking.find();

    if (!Bookings) {
      return errorHandler("No booking done yet.", 404);
    }
    // Send response
    res.status(200).json({
      message: "Booking fetched successfully.",
      Bookings: Bookings,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
