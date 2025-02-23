const { Schema, model } = require("mongoose");

const Session = new Schema({
  refreshToken: {
    type: String,
    default: "",
  },
});

const User = new Schema({
  email: {
    type: String,
  },
  role: {
    type: String,
    default: "user",
  },
  userName: {
    type: String,
  },

  password: {
    type: String,
  },
  refreshToken: {
    type: [Session],
  },
});

module.exports = model("User", User);
