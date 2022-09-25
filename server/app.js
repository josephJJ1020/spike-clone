const bodyParser = require("body-parser");
const cors = require("cors");

const { controller, User } = require("./controllers/controller");
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

/* -------------------------- SOCKET SIGNALING SERVER -------------------------- */

io.on("connection", (socket) => {
  // console.log(`users: ${onlineUsers.length}`);

  socket.on("user-connection", (data) => {
    if (data.id) {
      onlineUsers.push({
        id: data.id,
        // firstName: data.firstName,
        // lastName: data.lastName,
        email: data.email,
        socketId: socket.id,
      });
      // console.log(onlineUsers)
      // emit new list of online users to every user; user will then add online users list to their online users list in the frontend
      io.sockets.emit("onlineUsers", onlineUsers);
    }
  });

  // fetch user conversations and send it to newly connected user; takes in user id; maybe should execute this code on user connection
  socket.on("load-conversations", async (email) => {
    const conversations = await msgController.getUserConversations(email);

    conversations.forEach((conversation) => {
      socket.join(conversation._id); // add user to each conversation channel (uses conversation id as socket.io room id)
    });

    io.to(socket.id).emit("load-conversations", conversations);
  });

  // create new conversation (1 on 1 or group chat)
  socket.on("create-conversation", async (users) => {
    try {
      const newConversation = await msgController.makeConversation(users);

      onlineUsers.forEach((user) => {
        if (
          newConversation.participants.some(
            (participant) => participant.email === user.email
          )
        ) {
          io.to(user.socketId).emit("new-conversation", newConversation);
        }
      });
    } catch (err) {
      console.log(err.message);
    }

    // participants will add this new conversation to their conversations list in the frontend
  });

  // send new message
  socket.on("new-message", async ({ user, message, convoId }) => {
    const newConversation = await msgController.addMessage(
      user,
      message,
      convoId
    );

    onlineUsers.forEach((user) => {
      if (
        newConversation.participants.some(
          (participant) => participant.email === user.email 
        )
      ) {
        io.to(user.socketId).emit("new-message", newConversation);
      }
    });

    // participant will then add this new convo to conversations list in the frontend
  });

  // takes in receiverId, requesterId
  socket.on("friend-request", async (data) => {
    try {
      // save a notification of type 'friend-request' to receiver's notification list
      const friendRequest = await controller.sendFriendRequest(
        data.requesterId,
        data.receiverId
      );
      console.log("friend request sent! ");

      // send friend request event to receiver through their socket
      const onlineUser = onlineUsers.find(
        (user) => user.id === data.receiverId
      );
      if (onlineUser) {
        io.to(onlineUser.socketId).emit("friend-request", friendRequest);
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("friend-request-action", async (data) => {
    try {
      const notifs = await controller.handleFriendRequest(data);
      console.log(notifs);
      // update both sender and receiver notifications
      if (notifs.senderData && notifs.accepterData) {
        console.log("friend request accepted!");
        onlineUsers.forEach((user) => {
          // look for user who accepted the friend request (data.sender)
          if (user.id === data.sender) {
            io.to(user.socketId).emit(
              "accept-friend-request",
              notifs.accepterData
            );
          } else if (user.id === data.receiver) {
            // look for user who sent the friend request (data.receiver)
            io.to(user.socketId).emit(
              "accept-friend-request",
              notifs.senderData
            );
          }
        });
      } else {
        io.to(socket.id).emit("reject-friend-request", notifs.accepterData);
      }
    } catch (err) {
      console.log(err);
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
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

      if (userData) {
        console.log(userData);
        return res.send(userData);
      } else {
        return res.status(409).send("Failed to find user!");
      }

      // can't find user
    } catch (err) {
      return res.status(409).send("Failed to find user!");
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
