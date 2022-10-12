require("dotenv").config();

const Stun = require("node-turn");

const server = new Stun({
  authMech: "long-term",
  listeningPort: 4444,
  credentials: {
    username: process.env.TURN_PASSWORD,
  },
});

module.exports = server;
