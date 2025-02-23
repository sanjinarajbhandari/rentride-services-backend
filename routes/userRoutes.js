const express = require("express");
const userController = require("../controllers/user");
const router = express.Router();
const validateAdmin = require("../middlewares/validateAdmin");
//Route for user signup
router.post("/signup", userController.signup);

//Route for user login
router.post("/login", userController.login);
router.get("/fetchUser", userController.fetchUser);

router.get("/checkAdmin", validateAdmin(), (req, res) => {
  console.log(req.userRole, "up[puo");
  const userRole = req.userRole;
  if (userRole === "user") {
    res.status(200).json({ userRole, message: "User is admin" });
  } else {
    res.status(403).json({ userRole, message: "User is not admin" });
  }
});
// Route for user forget Password 
router.post("/passwordReset", userController.passwordReset);
// Route for user Password Reset
router.post("/resetPassword", userController.resetpassword);
// Route for user change Password 
router.post("/changePassword", userController.changePassword);

// Route for generating new token once the token is expires
router.post("/token", userController.token);

// Route for user logout
router.get("/logout", userController.logout);

module.exports = router;
