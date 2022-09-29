const mongoose = require("mongoose");
const UserSchema = require("../schemas/User");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");

const User = mongoose.model("User", UserSchema);

const controller = {
  createUser: async ({
    email,
    password,
    emailService,
    inboundHost,
    inboundPort,
    outboundHost,
    outboundPort,
  }) => {
    // check if email already exists
    const existingUser = await User.findOne({ email: email }).then(
      (data) => data
    );

    if (existingUser) {
      return new Error("Email already exists");
    }

    // hash password (omitted for testing with )
    /* const hashedPassword = await bcrypt.hash(password, 10); */

    // create new user
    let newUser = new User({
      email,
      password,
      emailService,
      inboundHost,
      inboundPort,
      outboundHost,
      outboundPort,
    });
    console.log(newUser);

    try {
      // not saving
      // save user and return user data
      await newUser.save();
      const user = await User.findOne({ email: email });
      console.log(`new user _id: ${user._id}`);
      if (user) {
        return user;
      }
    } catch (err) {
      // it's going to here
      console.log(err.message);
      return new Error("Failed to create new user");
    }
  },

  // searchUser method used for login
  searchUser: async ({ id, email, password }) => {
    console.log(`login email: ${email}`)
    console.log(`login password: ${password}`)
    if (email && password) {
      try {
        const user = await User.findOne({
          email: email,
          password: password, // uses plaintext password currently for nodemailer testing
        });

        console.log(user);

        if (user) {
          // hashing omitted for nodemailer testing
          // const match = await comparePasswords(password, user.password);
          // console.log(match);
          // if (match) {
          //   return user;
          // } else {
          //   console.log(`passwords don't match`);
          // }
          return user
        }
      } catch (err) {
        // console.log(err)
      }
    } else if (id && !email && !password) {
      try {
        let user = await User.findById(id);

        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password, // encrypt password when returned
          friends: user.friends,
        };
      } catch (err) {
        return err;
      }
    }
  },

  searchUserForNodemailer: async (email) => {
    try {
      return await User.findOne({email: email})
    } catch (err) {
      console.log(err.message)
    }
  },
  // handles sent friend requests
  sendFriendRequest: async (requesterId, receiverId) => {
    console.log(`requesterId: ${requesterId}`);
    console.log(`receiverId: ${receiverId}`);
    if (requesterId && receiverId) {
      try {
        const sender = await User.findById(requesterId);
        const requestTo = await User.findById(receiverId);

        console.log(`sender: ${sender}`);
        console.log(`receiver: ${requestTo}`);

        const friendRequest = {
          id: uuid().slice(0, 6),
          status: "PENDING",
          type: "friend-request",
          from: requesterId,
        };

        if (sender.friends.includes(requestTo._id)) {
          console.log(
            `${requestTo.firstName} is already in ${sender.firstName}'s friend list`
          );
        }
        // add a {type: 'friend-request' } notification to user's notification list
        requestTo.notifications.push(friendRequest);

        await requestTo.save();
        return friendRequest;
      } catch (err) {
        console.log(err);
      }
    }
  },

  // at this point, the sender is the one answering the friend request, so the notification belongs to the sender
  handleFriendRequest: async ({ id, type, sender, receiver }) => {
    console.log(`notif id: ${id}`);
    try {
      const user = await User.findById(sender);
      console.log(user.notifications);
      if (type === "ACCEPT") {
        const notif = user.notifications.find((n) => n.id === id);

        if (notif) {
          notif.status = "ACCEPTED";

          // add friend request sender id to friends list
          user.friends.push(receiver);
          await user.save();

          // add friend request receiver to sender's friend list
          const requestSender = await User.findById(receiver);
          requestSender.friends.push(sender);

          // add notification to friend request sender's notifications list
          const requestAccepted = {
            id: uuid().slice(0, 6),
            status: "ACCEPTED",
            type: "friend-request-accepted",
            from: sender,
          };

          requestSender.notifications.push(requestAccepted);
          await requestSender.save();

          // return sender and accepter notifications; update on frontend through socket
          return {
            // make this senderData and accepterData containing new friends list and notification list
            senderData: {
              friends: requestSender.friends,
              notifications: requestSender.notifications,
            },
            accepterData: {
              friends: user.friends,
              notifications: user.notifications,
            },
            // senderNotifs: requestSender.notifications,
            // accepterNotifs: user.notifications,
          };
        } else {
          console.log("cant find notif");
        }
      } else if (type === "REJECT") {
        // delete friend request from user's notifications list
        console.log(`sent id: ${id}`);
        const newNotifications = user.notifications.filter(
          (notif) => notif.id !== id
        );
        console.log(`new notifications: ${newNotifications}`);
        console.log("friend request rejected");

        // not setting proper notifications (rejected notification still pending, should be removed)
        user.notifications = newNotifications;
        console.log(user.notifications);
        await user.save();

        return {
          accepterData: {
            friends: user.friends,
            notifications: user.notifications,
          },
        };
      }
    } catch (err) {}
  },
};

const comparePasswords = async (textPassword, hashedPassword) => {
  return await bcrypt.compare(textPassword, hashedPassword);
};

module.exports = { controller, User };
