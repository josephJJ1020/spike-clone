const mongoose = require("mongoose");
const UserSchema = require("../schemas/User");

const User = mongoose.model("User", UserSchema);

const controller = {
  createUser: async ({firstName, lastName, email, password}) => {
    // check if email already exists
    const existingUser = await User.findOne({ email: email }).then(
      (data) => data
    );

    if (existingUser) {
      return new Error("Email already exists");
    }

    // create new user
    let newUser = new User({ firstName: firstName, lastName: lastName, email: email, password: password });

    try {
      // save user and return user data
      await newUser.save();
      const user = await User.findOne({ email: email });
      return {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
        friends: user.friends,
      };
    } catch (err) {
      return new Error("Failed to create new user");
    }
  },

  // searchUser method used for login
  searchUser: async ({id, email, password}) => {
    if (email && password) {
      
      let user = await User.findOne({ email: email, password: password })

      if (user) {
        console.log('user')
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password, // encrypt password when returned
          friends: user.friends,
        };
      } else {
        return new Error("Failed to find user");
      }

    } else if (id && !email && !password) {
      let user = await User.findById(id)

      if (user) {
        console.log(`user found with id: ${user}`)
        return {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: user.password, // encrypt password when returned
          friends: user.friends,
        };
      } else {
        return new Error("Failed to find user");
      }
    }
  },
};

module.exports = {controller, User}
