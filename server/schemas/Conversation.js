const mongoose = require("mongoose");

const Conversation = new mongoose.Schema({
  dateCreated: {
    type: Date,
    default: Date.now(),
  },
  participants: {
    // stores user Ids
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
