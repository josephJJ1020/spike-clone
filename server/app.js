const bodyParser = require("body-parser");
const cors = require("cors");
const controller = require("./controllers/controller");

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
let conversations = []; // list of conversations
let messages = [];

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

io.on("connection", (socket) => {
  // console.log(`users: ${onlineUsers.length}`);

  socket.on("user-connection", (Id) => {
    if (Id) {
      // let user = users.find((existingUser) => existingUser.id === Id);

      // if (user) {
      //   console.log(user.id);
      //   currentUser = user;
      //   user.socketId = socket.id;
      //   onlineUsers.push(user);
      // } else {
      //   let user = { id: Id, socketId: socket.id };
      //   currentUser = user;
      //   console.log("added new user");
      //   users.push(user);
      //   onlineUsers.push(user);
      // }
      onlineUsers.push({ id: Id, socketId: socket.id });

      // console.log(`line 61: `, JSON.stringify(currentUser));
      // emit new list of online users to every user; user will then add online users list to their online users list in the frontend
      io.sockets.emit("onlineUsers", onlineUsers);
    }
  });

  // fetch user conversations and send it to newly connected user; takes in user id; maybe should execute this code on user connection
  socket.on("load-conversations", (id) => {
    let userConvos = [];

    if (conversations) {
      conversations.forEach((convo) => {
        let user = convo.participants.find(
          (existingUser) => existingUser.id === id
        );
        if (user) {
          userConvos.push(convo);
        }
        io.to(socket.id).emit("load-conversations", userConvos);
      });
    } else {
      console.log("no conversations yet");
    }
  });

  // create new conversation (1 on 1 or group chat)
  socket.on("create-conversation", (data) => {
    const newConversation = {
      // create new conversation
      id: data.id,
      participants: data.participants, // must be an array of user objects
      messages: [
        // {
        //   author: null,
        //   message: {from: null, to: null, message: null},
        // },
      ],
    };

    conversations.push(newConversation); // add conversation to conversations list

    newConversation.participants.forEach((participant) => {
      io.to(participant.socketId).emit("new-conversation", newConversation); // send the new conversation object to participants
    });

    // participants will add this new conversation to their conversations list in the frontend
  });

  // send new message
  socket.on("new-message", (message) => {
    // let convo = conversations.find((convo) => convo.id === message.convoId); // find convo Id in conversations list
    // convo.messages.push(message.msg); // add a new message to the conversation
    // convo.participants.forEach((participant) => {
    //   // send new message to convo participants if they're online
    //   if (onlineUsers.includes(participant)) {
    //     io.to(participant.socketId).emit("new-message", {
    //       convoId: convo.id,
    //       msg: message.msg,
    //     });
    //   }
    // });
    // participant will then add this message to the appropriate convo in their conversations list in the frontend
    console.log(message);
    messages.push(message);
    io.to(message.from.socketId).emit("new-message", message);
    io.to(message.to.socketId).emit("new-message", message);
  });

  socket.on("disconnect", () => {
    // console.log(`removed user with socket id ${socket.id}`);
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    // console.log(`updated online users: ${onlineUsers}`);
  });
});

/*

BACKEND ROUTES

*/

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
      console.log(userData)
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

app.use((req, res) => {
  res.send("Nothing to see here :)");
});

server.listen(PORT, console.log(`listening on port ${PORT}`));
