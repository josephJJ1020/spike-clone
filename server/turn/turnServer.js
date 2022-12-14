require("dotenv").config();

const Turn = require("node-turn");
const server = new Turn({
  // options
  authMech: "none",
  listeningPort: 6581,
  credentials: {
    [process.env.TURN_PASSWORD]: process.env.TURN_PASSWORD,
  },
  debugLevel: "INFO",
});
server.ex
module.exports = server;
