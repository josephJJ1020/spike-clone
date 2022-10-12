require("dotenv").config();

const Turn = require("node-turn");
const server = new Turn({
  // options
  authMech: "none",
  listeningPort: 4444,
  credentials: {
    username: process.env.TURN_PASSWORD,
  },
});

module.exports = server;
