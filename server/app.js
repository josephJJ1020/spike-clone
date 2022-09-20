const bodyParser = require("body-parser");
const cors = require("cors");
const { controller } = require("./controllers/controller");
const msgController = require("./controllers/msgController");

const mongoose = require("mongoose");

const express = require("express");
const app = express();

const server = require("http").createServer(app);
const { Server } = require("socket.io");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

require("dotenv").config();

// mongoose connection; connect mongoose to MongoDB database
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGOOSE_URI);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_ORIGIN, methods: ["GET", "POST"] }, // instantiate socket.io server with cors
});

const PORT = process.env.PORT || 3001;

let onlineUsers = []; // list of online users

/* 

conversation shape:
{
  id: convoId (created server side with uuid),
  participants: [list of participants (uses socket Id )],
  messages: [
    {
      author: socket.id,
      message: `${socket.id} created a conversation!`,
    },
  ],
};

*/

/* -------------------------- SOCKET SIGNALING SERVER -------------------------- */

io.on("connection", (socket) => {
  // console.log(`users: ${onlineUsers.length}`);

  socket.on("user-connection", (Id) => {
    if (Id) {
      onlineUsers.push({ id: Id, socketId: socket.id });

      // emit new list of online users to every user; user will then add online users list to their online users list in the frontend
      io.sockets.emit("onlineUsers", onlineUsers);
    }
  });

  // fetch user conversations and send it to newly connected user; takes in user id; maybe should execute this code on user connection
  socket.on("load-conversations", async (userId) => {
    const conversations = await msgController.getUserConversations(userId);

    conversations.forEach((conversation) => {
      socket.join(conversation._id); // add user to each conversation channel (uses conversation id as socket.io room id)
    });

    io.to(socket.id).emit("load-conversations", conversations);
  });

  // create new conversation (1 on 1 or group chat)
  socket.on("create-conversation", async (users) => {
    const newConversation = msgController.makeConversation(users);
    // TODO: join all participants in the conversation to socket.io room (socket.io room = conversation._id)

    // participants will add this new conversation to their conversations list in the frontend
  });

  // send new message
  socket.on("new-message", async (user, message, convoId) => {
    const newConversation = await msgController.addMessage(
      user,
      message,
      convoId
    );

    // remember we are using convoId as socket.io room; send this new conversation to all participants via their sockets
    io.sockets.in(convoId).emit("new-message", newConversation);

    // participant will then add this new convo to conversations list in the frontend
  });

  socket.on("disconnect", () => {
    // console.log(`removed user with socket id ${socket.id}`);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    // console.log(`updated online users: ${onlineUsers}`);
  });
});

/* -------------------------- BACKEND ROUTES -------------------------- */

// user signup
app.post("/signup", async (req, res) => {
  console.log("someone signed up!!");

  if (!req.body || req.body === undefined) {
    console.log("no data sent");
    return res.send(new Error("No signup credentials specified"));
  }

  let { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    console.log("incomplete credentials");
    return res.send(new Error("Please complete signup credentials"));
  }

  try {
    const newUser = await controller.createUser({
      firstName,
      lastName,
      email,
      password,
    });
    console.log(newUser);
    return res.send(newUser);
  } catch (err) {
    console.log(err.message);
    return res.send(err);
  }
});

// user login
app.post("/login", async (req, res) => {
  if (!req.body) {
    return res.send(new Error("No ID, email, or password specified"));
  }

  let { id, email, password } = req.body;

  // if user ID is used to query (meaning user ID is in client session)
  if (id) {
    try {
      console.log(`id: ${id}`);
      const userData = await controller.searchUser(id);
      console.log(userData);
      return res.send(userData);
    } catch (err) {
      return res.send(err);
    }

    // if user email and user password are used to query (meaning )
  } else if (email && password) {
    console.log("someone logged in!");
    try {
      const userData = await controller.searchUser({ email, password });
      return res.send(userData);
    } catch (err) {
      console.log(err);
      return res.send(err);
    }
  }

  // if id, email, and password keys are specified but no values are sent
  else {
    // new Error("No ID, email, or password specified")
    return res.send(new Error("No ID, email, or password specified"));
  }
});


// handle invalid routes
app.use((req, res) => {
  res.send("Nothing to see here :)");
});

server.listen(PORT, console.log(`listening on port ${PORT}`));
