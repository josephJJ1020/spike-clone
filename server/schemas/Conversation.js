const mongoose = require("mongoose");

const Conversation = new mongoose.Schema({
  identifier: {
    type: String,
    default: ''
  },
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  participants: {
    type: [],
    default: [],
    required: "Conversation must include participants",
  },
  messages: {
    type: Array,
    default: [],
  },
});

module.exports = Conversation;
