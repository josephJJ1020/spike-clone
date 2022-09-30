const fs = require("fs");

const bodyParser = require("body-parser");
const cors = require("cors");

const { controller, User } = require("./controllers/controller");
const msgController = require("./controllers/msgController");
const EmailListener = require("./email/mailListener");
const sendMail = require("./email/sendEmail");

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
let emailListeners = [];

/* -------------------------- SOCKET SIGNALING SERVER -------------------------- */

io.on("connection", (socket) => {
  socket.on("login", (data) => {
    // init user's email listener
  });

  // add user to onlineUsers array on connection
  socket.on("user-connection", async (data) => {
    // check if user data is sent
    if (data.id) {
      onlineUsers.push({
        id: data.id,
        email: data.email,
        socketId: socket.id,
      });
      // emit new list of online users to every user; user will then add online users list to their online users list in the frontend
      io.sockets.emit("onlineUsers", onlineUsers);

      // update onlineUsers for each email listener in emailListeners array
      emailListeners.forEach((listener) => {
        listener.setOnlineUsers(onlineUsers);
      });

      // add user's email listener to emailListeners array in case it doesn't exist yet
      const listener = emailListeners.find(
        (listener) => listener.email === data.email
      );

      if (!listener) {
        const user = await controller.searchUserForNodemailer(data.email);

        if (user) {
          console.log(user);
          const emailListener = new EmailListener(
            user.email,
            user.password,
            user.inboundHost,
            user.inboundPort,
            io,
            onlineUsers
          );

          emailListeners.push(emailListener);
          emailListener.init();
          emailListener.start();

          emailListeners.forEach((listener) => {
            listener.setOnlineUsers(onlineUsers);
          });
        }
      }
    }
  });

  // add user's email listener to emailListeners array on login
  socket.on("login", async (data) => {
    const listener = emailListeners.find(
      (listener) => listener.email === data.email
    );

    if (!listener) {
      const user = await controller.searchUserForNodemailer(data.email);

      if (user) {
        console.log(user);
        const emailListener = new EmailListener(
          user.email,
          user.password,
          user.inboundHost,
          user.inboundPort,
          io,
          onlineUsers
        );

        emailListeners.push(emailListener);
        emailListener.init();
        emailListener.start();

        emailListeners.forEach((listener) => {
          listener.setOnlineUsers(onlineUsers);
        });
      }
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
  socket.on(
    "new-message",
    async ({ user, message, convoId, subject = null, files }) => {
      console.log(`user email: ${user.email}`);

      console.log(files);

      // note: store file names as well, not just the buffer, in the frontend
      // so it can be used for the file upload path name (done)

      let filesList = [];

      // 1. upload files to file directory and add each file to filesList array (which will be passed into the message controller)
      files.forEach(async (file) => {
        try {
          if (!fs.existsSync(`${__dirname}/files/${file.filename}`)) {
            fs.writeFileSync(`${__dirname}/files/${file.filename}`, file.file);

            console.log(`uploaded ${file.filename}`);
            console.log(filesList);
          }

          filesList.push({
            filename: file.filename,
            fileLink: `http://localhost:3001/${file.filename}`,
          });
        } catch (err) {
          console.log(err);
        }
      });

      // 4. push message object to conversation document in database
      // 5. emit updated conversation including the filenames and filelinks
      //
      const newConversation = await msgController.addMessage(
        user,
        message,
        convoId,
        filesList
      );

      console.log(`filesList: ${filesList}`);
      // set up toEmails array
      let toEmailsArray = [];

      newConversation.participants.forEach((participant) => {
        if (participant.email !== user.email) {
          toEmailsArray.push(participant.email);
        }
      });

      try {
        const mailer = await controller.searchUserForNodemailer(user.email);
        // create email after storing message in database
        console.log(mailer.email);
        console.log(mailer.emailService);

        sendMail({
          fromEmail: mailer.email,
          password: mailer.password,
          service: mailer.emailService,
          host: mailer.outboundHost,
          port: mailer.outboundPort,
          toEmails: toEmailsArray,
          subject: subject,
          text: message.content,
          files: filesList,
        });
        console.log("email sent");
      } catch (err) {
        console.log(err);
      }

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
    }
  );

  // takes in receiverId, requesterId
  socket.on("friend-request", async (data) => {
    try {
      // save a notification of type 'friend-request' to receiver's notification list
      const friendRequest = await controller.sendFriendRequest(
        data.requesterId,
        data.receiverId
      );

      // send friend request event to receiver through their socket
      const onlineUser = onlineUsers.find(
        (user) => user.id === data.receiverId
      );
      if (onlineUser) {
        io.to(onlineUser.socketId).emit("friend-request", friendRequest);
      }
    } catch (err) {
      console.log(err.message);
    }
  });

  socket.on("friend-request-action", async (data) => {
    try {
      const notifs = await controller.handleFriendRequest(data);
      // update both sender and receiver notifications
      if (notifs.senderData && notifs.accepterData) {
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
      console.log(err.message);
    }
  });

  /* --------------------- WebRTC --------------------- */
  socket.on("offer", (data) => {
    // if receiver is online, send offer to receiver's socket; else send callee-offline event
    let receiverOnline;

    const receiver = onlineUsers.find((user) => user.email === data.receiver);

    if (receiver) {
      io.to(receiver.socketId).emit("offer", data);
      receiverOnline = true;
    }

    // if receiver is not online, send callee-offline event to caller
    if (!receiverOnline) {
      const sender = onlineUsers.find((user) => user.email === data.sender);

      if (sender) {
        io.to(sender.socketId).emit("callee-offline", data.receiver);
      }
    }
  });

  socket.on("answer", (data) => {
    // answering a call means caller is already online
    const receiver = onlineUsers.find((user) => user.email === data.receiver);

    if (receiver) {
      io.to(receiver.socketId).emit("answer", data);
    }
  });

  socket.on("add-ice-candidate", (data) => {
    try {
      io.to(
        onlineUsers.find((user) => user.email === data.receiver).socketId
      ).emit("add-ice-candidate", data);
    } catch (err) {}
  });

  socket.on("reject-offer", (data) => {
    io.to(
      onlineUsers.find((user) => user.email === data.receiver).socketId
    ).emit("reject-offer", data.sender);
  });

  socket.on("call-ended", (data) => {
    const receiver = onlineUsers.find((user) => user.email === data.receiver);

    if (receiver) {
      io.to(receiver.socketId).emit("call-ended", data);
    }
  });

  socket.on("call-unavailable", (data) => {
    const receiver = onlineUsers.find((user) => user.email === data.receiver);

    if (receiver) {
      io.to(receiver.socketId).emit("call-unavailable", data);
    }
  });

  /* --------------------- disconnect/logout --------------------- */
  socket.on("logout", (data) => {
    //note: only start mail user's mail listener on "login" event sent after user logs in/signs up
    // or maybe just keep it running forever

    // stop and remove user's email listener from emailListeners array
    const emailListener = emailListeners.find(
      (listener) => listener.email === data.email
    );

    if (emailListener) {
      emailListener.close();
      emailListeners = emailListeners.filter(
        (listener) => listener.email !== emailListener.email
      );
    }
  });

  // remove user from onlineUsers array on disconnect
  socket.on("disconnect", () => {
    const onlineUser = onlineUsers.find((user) => user.socketId === socket.id);

    if (onlineUser) {
      onlineUsers = onlineUsers.filter(
        (user) => user.socketId !== onlineUser.socketId
      );
    }

    // update onlineUsers for each email listener in emailListeners array

    emailListeners.forEach((listener) => {
      listener.setOnlineUsers(onlineUsers);
    });
  });
});

/* -------------------------- BACKEND ROUTES -------------------------- */

// user signup
app.post("/signup", async (req, res) => {
  console.log(req.body);
  if (!req.body || req.body === undefined) {
    return res.send(new Error("No signup credentials specified"));
  }

  let {
    email,
    password,
    emailService,
    inboundHost,
    inboundPort,
    outboundHost,
    outboundPort,
  } = req.body;

  if (!email || !password || !emailService || !inboundHost || !inboundPort) {
    console.log("error");
    return res.send(new Error("Please complete signup credentials"));
  }

  try {
    let newUser;
    if (outboundHost || outboundHost.length) {
      newUser = await controller.createUser({
        email,
        password,
        emailService,
        inboundHost,
        inboundPort: parseInt(inboundPort),
        outboundHost,
        outboundPort: parseInt(outboundPort),
      });
    } else {
      newUser = await controller.createUser({
        email,
        password,
        emailService,
        inboundHost,
        inboundPort: parseInt(inboundPort),
      });
    }

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
      const userData = await controller.searchUser(id);
      return res.send(userData);
    } catch (err) {
      return res.send(err.message);
    }

    // if user email and user password are used to query (meaning )
  } else if (email && password) {
    try {
      const userData = await controller.searchUser({ email, password });
      console.log(`found user: ${userData.email}`);
      if (userData) {
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

// view message attachment
app.get("/:filename", (req, res) => {
  res.sendFile(`${__dirname}/files/${req.params.filename}`);
});

// handle invalid routes
app.use((req, res) => {
  res.send("Nothing to see here :)");
});

server.listen(PORT, console.log(`listening on port ${PORT}`));
