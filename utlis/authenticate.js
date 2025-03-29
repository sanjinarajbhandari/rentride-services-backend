require("dotenv").config;
const jwt = require("jsonwebtoken");

exports.getToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

exports.getRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
};

//create a token for resetting password
exports.getPasswordResetToken = (user) => {
  return jwt.sign(user, process.env.PASSWORD_RESET_TOKEN_SECRET, {
    expiresIn: process.env.PASSWORD_RESET_TOKEN_EXPIRY,
  });
};

exports.validateToken = (req, res, next) => {
  const header = req.headers["authorization"];
  const token = header && header.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
