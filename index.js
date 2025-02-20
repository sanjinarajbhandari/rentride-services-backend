require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const url = process.env.MONGO_DB_CONNECTION;

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

//Database Connection
mongoose
  .connect(url)
  .then(() => {
    //Create Server
    app.listen(process.env.PORT || 8081, () => {
      console.log(`Listening to PORT : ${process.env.PORT}`);
    });
  })
  .catch((error) => console.log(error));
