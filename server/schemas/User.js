const mongoose = require("mongoose");

const validateEmail = (email) => {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: "Email is required",
    validate: [validateEmail, "Please enter a valid email"],
    unique: true,
  },

  password: {
    type: String,
    required: "Password is requried",
  },

  emailService: {
    type: String,
    required: "Email service is required",
  },

  inboundHost: {
    type: String,
    required: "Inbound host is required",
  },

  inboundPort: {
    type: Number,
    required: "Inbound port is required",
  },

  outboundHost: {
    type: String,
    default: null,
  },

  outboundPort: {
    type: Number,
    default: null,
  },

  dateCreated: {
    type: Date,
    default: Date.now(),
  },

  socketId: {
    type: String,
  },

  friends: {
    type: Array,
    default: [],
  },

  conversations: {
    type: Array,
    default: [],
  },

  notifications: {
    type: Array,
    default: [],
  },
});

module.exports = UserSchema;
