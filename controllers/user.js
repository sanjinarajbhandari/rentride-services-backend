require("dotenv").config();
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const sendPasswordResetMail = require("../utlis/mail");
const {
  getToken,
  getRefreshToken,
  getPasswordResetToken,
} = require("../utlis/authenticate");
const jwt = require("jsonwebtoken");

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
      { id: user._id.toString(), role: user.role.toString() },
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
//triggered when forgot password button is clicked
exports.passwordReset = async (req, res, next) => {
  const email = req.body.email;
  console.log(email, "data");

  const user = await User.findOne({ email: email });
  console.log(email, user, "data");

  if (!user) return res.sendStatus(401);
  const passwordResetToken = getPasswordResetToken({ _id: user._id });
  console.log(passwordResetToken, "resettoken");

  sendPasswordResetMail(passwordResetToken, email);
  res.status(200).json({ message: "Message sent" });
};

//actual code to reset
exports.resetpassword = async (req, res, next) => {
  console.log(req.body, "bods");
  const token = req.body.token;
  const email = "mowyqolu@mailinator.com";
  const hashedPassword = bcryptjs.hashSync(req.body.newPassword, 12);

  jwt.verify(token, process.env.PASSWORD_RESET_TOKEN_SECRET, async (err) => {
    if (err) {
      return res.status(401).json({ message: "Token verification failed" });
    }

    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      console.log("done");
      user.password = hashedPassword;
      await user.save();

      // Respond with success status and message after password reset completes
      return res.status(200).json({ message: "Password reset successful" });
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
};

//change when you know old password
exports.changePassword = async (req, res, next) => {
  try {
    //find the user
    console.log("herre");
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
