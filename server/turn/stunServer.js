require('dotenv').config()

const Stun = require("node-turn");

const server = new Stun({
  authMech: "long-term",
  credentials: {
    username: process.env.TURN_PASSWORD,
  },
});

module.exports = server;