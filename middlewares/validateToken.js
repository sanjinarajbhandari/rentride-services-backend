require("dotenv").config();
const jwt = require("jsonwebtoken");
const errorHandler = require("./error-handler");

module.exports = (roles) => {
  return (req, res, next) => {
    const accessTokenCookie = req.cookies["access_Token"];

    let decodedToken;
    if (accessTokenCookie) {
      decodedToken = jwt.verify(accessTokenCookie, process.env.JWT_SECRET);
    }
    console.log(decodedToken, accessTokenCookie, "error");
    if (roles.includes(decodedToken.role)) {
      next();
    } else {
      res.status(403).send("Unauthorized");
    }

    if (roles && !roles.includes(decodedToken.role.trim())) {
      return errorHandler("You don't have permissions.", 401);
    }
  };
};
