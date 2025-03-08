require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const url = process.env.MONGO_DB_CONNECTION;

//local imports
const bookingRoutes = require("./routes/bookingRoutes");
const vehicleRoutes = require("./routes/vehicleRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const availabilityUpdate = require("./utlis/schedule");
const khaltiRoutes = require("./routes/khaltiRoutes");
const checkoutRoutes = require("./routes/checkoutRoute");
const whitelist = process.env.WHITELISTED_DOMAINS;

const app = express();
app.use(cookieParser());

//CORS Headers
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Routes Middleware
app.use(userRoutes);
app.use(productRoutes);
app.use(vehicleRoutes);
app.use(bookingRoutes);
app.use(khaltiRoutes);
app.use(checkoutRoutes);

//Database Connection
mongoose
  .connect(url)
  .then(() => {
    //Create Server
    app.listen(process.env.PORT || 8081, () => {
      console.log(`Listening to PORT : ${process.env.PORT}`);
    });
    availabilityUpdate();
  })
  .catch((error) => console.log(error));
