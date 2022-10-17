const mongoose = require("mongoose");
const UserSchema = require("../schemas/User");
const { v4: uuid } = require("uuid");
const bcrypt = require("bcrypt");

const User = mongoose.model("User", UserSchema);

const controller = {
  createUser: async ({
    email,
    password,
    appPassword,
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
      appPassword,
      inboundHost,
      inboundPort,
      outboundHost,
      outboundPort,
    });

    try {
      // not saving
      // save user and return user data
      await newUser.save();
      const user = await User.findOne({ email: email });
      if (user) {
        return user;
      }
    } catch (err) {
      console.log(err.message);
      return new Error("Failed to create new user");
    }
  },

  // searchUser method used for login
  searchUser: async ({ id, email, password }) => {
    if (email && password) {
      try {
        const user = await User.findOne(
          {
            email: email,
            password: password, // uses plaintext password currently for nodemailer testing
          },
          { password: 0 }
        );

        if (user) {
          // hashing omitted for nodemailer testing
          // const match = await comparePasswords(password, user.password);

          // if (match) {
          //   return user;
          // } else {
          //   console.log(`passwords don't match`);
          // }
          return user;
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
          // password: user.password, // encrypt password when returned
        };
      } catch (err) {
        return err;
      }
    }
  },

  searchUserForCall: async (email) => {
    const user = await User.findOne({ email: email });

    if (user) {
      return user;
    }

    return null;
  },

  searchUserForNodemailer: async (email) => {
    try {
      return await User.findOne({ email: email });
    } catch (err) {
      console.log(err.message);
    }
  },

  setUserLastFetched: async (email, date) => {
    try {
      await User.updateOne({ email: email }, { lastFetched: date });
    } catch (err) {
      console.log(err);
    }
  },
};

const comparePasswords = async (textPassword, hashedPassword) => {
  return await bcrypt.compare(textPassword, hashedPassword);
};

module.exports = { controller, User };
