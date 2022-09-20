const mongoose = require("mongoose");

const validateEmail = (email) => {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: "First name is required",
  },

  lastName: {
    type: String,
    required: "Last name is required",
  },

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
    default: []
  }
});

module.exports = UserSchema;
