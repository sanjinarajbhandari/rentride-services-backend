require("dotenv").config();
const jwt = require("jsonwebtoken");
const errorHandler = require("./error-handler");

module.exports = () => {
  return (req, res, next) => {
    const accessTokenCookie = req.cookies["access_Token"];

    let decodedToken;
    if (accessTokenCookie) {
      try {
        decodedToken = jwt.verify(accessTokenCookie, process.env.JWT_SECRET);

        req.userRole = decodedToken.role;
        next();
      } catch (error) {
        errorHandler(error, req, res);
      }
    } else {
      res.status(403).json({ message: "Access token not provided" });
    }
  };
};
