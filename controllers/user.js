require("dotenv").config();
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const Vehicle = require("../models/vehicleModel");
const Bookings = require("../models/bookingModel");
const {
  getToken,
  getRefreshToken,
  getPasswordResetToken,
} = require("../utlis/authenticate");
const jwt = require("jsonwebtoken");
const sendPasswordResetMail = require("../utlis/mail");
const nodemailer = require("nodemailer");

exports.signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    //check if any error is present
    if (!errors.isEmpty()) {
      const errorMessage = errors.array()[0].msg;
      const error = new Error(errorMessage);
      error.statusCode = 422;
      throw error;
    }
    const userexist = await User.findOne({ email: req.body.email });

    if (userexist) {
      res.status(500).json({
        message: "Account Already Exists",
      });
      return;
    }

    const hashedPassword = bcryptjs.hashSync(req.body.password, 10);
    // Create a new user and set its properties
    const user = new User({
      userName: req.body.userName,
      email: req.body.email,
      password: hashedPassword,
    });
    const refreshToken = getRefreshToken({ _id: user._id });

    if (user) {
      user.refreshToken.push({ refreshToken });

      // Save the user to the database
      await user.save();

      res.status(201).json({
        message: "Successful Registration",
        user: user,
      });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    //check if any error is present
    if (!errors.isEmpty()) {
      const errorMessage = errors.array()[0].msg;
      const error = new Error(errorMessage);
      error.statusCode = 422;
      throw error;
    }
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    if (!user) {
      res.status(401).json({
        message: "User does not exist",
      });
      return;
    }

    const password = req.body.password;
    const isEqual = bcryptjs.compareSync(password, user.password);
    if (!isEqual) {
      return res.status(401).json({ message: "Wrong Credentials" });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        role: user.role.toString(),
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    const { password: pass, ...rest } = user._doc;
    res
      .cookie("access_Token", token, { httpOnly: true })
      .status(200)
      .json({ rest, message: "successfull login", role: rest.role });
  } catch (err) {
    return err;
  }
};

exports.fetchUser = async (req, res, next) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No Users logged yet." });
    }

    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user._doc;
      return userWithoutPassword;
    });

    // Send response
    res.status(200).json({
      message: "Users fetched successfully.",
      Users: usersWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    next(error);
  }
};

exports.token = async (req, res, next) => {
  const email = req.body.email;
  const user = await User.findOne({ email: email });

  const refreshToken = user.refreshToken[0].refreshToken;

  if (refreshToken == null) return res.sendStatus(401);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = getToken({ _id: user._id });
    res.json({ accessToken: accessToken });
  });
};

exports.passwordReset = async (req, res, next) => {
  const email = req.body.email;

  const user = await User.findOne({ email: email });

  if (!user) return res.sendStatus(401);
  const passwordResetToken = getPasswordResetToken({ _id: user._id });

  console.log(passwordResetToken);
  console.log(email);

  // sendPasswordResetMail(passwordResetToken, email);
  const email_client = email;
  const email_host = "rajbhandarisanjina3@gmail.com";
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email_host,
      pass: process.env.GMAIL_PASS,
    },
    secure: true,
  });

  const mailData = {
    from: email_host,
    to: email_client,
    subject: "Reset Password",
    text: "Change your password",
    html: `
      <p>Click on the button below to change your password:</p>
      <a href="http://localhost:3000/resetForm?token=${passwordResetToken}&email=${email_client}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
  `,
  };

  transporter.sendMail(mailData, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info, "Mail has been sent Successfully");
    }
  });

  res.status(200).json({ message: "Message sent" });
};

exports.resetpassword = async (req, res, next) => {
  const email = req.body.email;
  const hashedPassword = bcryptjs.hashSync(req.body.newPassword, 12);

  try {
    const user = await User.findOne({ email: email });

    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    user.password = hashedPassword;
    await user.save();

    // Respond with success status and message after password reset completes
    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
  // });
};

//change when you know old password
exports.changePassword = async (req, res, next) => {
  try {
    //find the user
    const email = req.body.email;
    const user = await User.findOne({ email: email });

    //input user old and new password
    const oldPassword = req.body.oldPassword;
    const hashedPassword = bcryptjs.hashSync(req.body.newPassword, 12);

    //verify if old password is same as saved in database

    const isEqual = bcryptjs.compareSync(oldPassword, user.password);
    if (!isEqual) {
      res.status(401).json({
        message: "Wrong password. Please enter a correct one.",
      });
    } else {
      user.password = hashedPassword;

      //save the user
      await user.save();

      res.status(200).json({
        message: "Password Changed successfully",
      });
    }
  } catch (err) {
    res.send(err);
  }
};

exports.logout = (req, res, next) => {
  try {
    res.clearCookie("access_Token");
    res.status(200).json("User has been logged out");
  } catch (error) {
    next(error);
  }
};
exports.getDashboardSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalVehicles = await Vehicle.countDocuments();
    const totalBookedVehicles = await Vehicle.countDocuments({
      availability: false,
    });
    const totalAvailableVehicles = await Vehicle.countDocuments({
      availability: true,
    });

    // New Metrics from Bookings
    const totalBookings = await Bookings.countDocuments();
    const totalRevenue = await Bookings.aggregate([
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);

    const upcomingCheckouts = await Bookings.countDocuments({
      checkOutDate: { $gte: new Date() },
    });

    const recentBookings = await Bookings.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("userName email model checkOutDate price");

    res.json({
      totalUsers,
      totalAdmins,
      totalVehicles,
      totalBookedVehicles,
      totalAvailableVehicles,
      totalBookings,
      totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
      upcomingCheckouts,
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getVendors = async (req, res, next) => {
  try {
    const vendors = await User.find({ role: "vendor" });

    if (!vendors.length) {
      return res.status(404).json({ message: "No vendor members found." });
    }

    const vendorList = vendors.map(
      ({ password, ...vendorData }) => vendorData._doc
    );

    res.status(200).json({
      message: "Vendor members fetched successfully.",
      vendors: vendorList,
    });
  } catch (error) {
    console.error("Error fetching vendor:", error);
    res.status(500).json({ error: "Internal Server Error" });
    next(error);
  }
};

exports.addVendor = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    const userExist = await User.findOne({ email });

    if (userExist) {
      return res.status(400).json({ message: "Vendor member already exists" });
    }

    const hashedPassword = bcryptjs.hashSync(password, 10);

    const newVendor = new User({
      userName,
      email,
      password: hashedPassword,
      role: "vendor",
    });

    await newVendor.save();

    res
      .status(201)
      .json({ message: "Vendor added successfully", vendor: newVendor });
  } catch (error) {
    next(error);
  }
};

exports.deleteVendor = async (req, res, next) => {
  try {
    const { vendorId } = req.params;
    const vendor = await User.findById(vendorId);

    if (!vendor || vendor.role !== "vendor") {
      return res.status(404).json({ message: "Vendor member not found" });
    }

    await User.findByIdAndDelete(vendorId);

    res.status(200).json({ message: "Vendor deleted successfully" });
  } catch (error) {
    next(error);
  }
};
