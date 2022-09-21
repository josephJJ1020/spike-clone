import validator from "email-validator";

// use to get user data from the server
export const getAuth = async ({
  id = null,
  email,
  password,
  firstName = null,
  lastName = null,
  action,
}) => {
  let userData = {
    id: null,
    email: null,
    firstName: null,
    lastName: null,
    friends: [],
  };

  let error = null;

  if ([id, email, firstName, lastName].every((item) => !item)) {
    error = setError(new Error("Please provide credentials"));
    return { userData, error };
  }

  if (action === "LOGIN") {
    if (!id && !email) {
      console.log("No email provided");
      error = setError(new Error("Please provide credentials"));
      return { userData, error };
    }

    if ((email && !password) || (!email && password)) {
      error = setError(new Error("Please complete login credentials"));
      return { userData, error };
    }
  }

  if (action === "SIGNUP" && (!email || !password || !firstName || !lastName)) {
    error = setError(new Error("Incomplete signup credentials."));
    return { userData, error };
  }

  if (!validator.validate(email)) {
    error = setError(new Error("Invalid email."));
    return { userData, error };
  }

  switch (action) {
    case "LOGIN":
      console.log("login");

      await fetchUserData({
        uri: process.env.REACT_APP_LOGIN_URI,
        email: email,
        password: password,
      })
        .then((data) => {
          return data.json();
        })
        .then((user) => {
          // if (user.error) {
          //   setError(user.error);
          //   return;
          // }
          console.log(user)
          userData = setUser({
            user,
          });
        })
        .catch(
          (err) =>
            (error = setError(new Error("User not found, please try again.")))
        );

      break;

    case "SIGNUP":
      await fetchUserData({
        uri: process.env.REACT_APP_SIGNUP_URI,
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
      })
        .then((data) => data.json())
        .then((user) => {
          if (userData.error) {
            setError(userData.error);
            return;
          }
          userData = setUser({
            user,
          });

          console.log(userData);
        })
        .catch(
          (err) =>
            (error = setError(new Error("User not found, please try again.")))
        );
      break;

    default:
      fetchUserData({ uri: process.env.REACT_APP_LOGIN_URI, id: id })
        .then((data) => data.json())
        .then((user) => {
          userData = setUser({
            id: user.id,
            email: user.email,
            firstName: user.first,
            lastName: user.lastName,
            friends: user.friends,
          });
        })
        .catch(
          (err) =>
            (error = setError(new Error("User not found, please try again.")))
        );
  }

  return { userData, error };
};

const setUser = (newUser) => {
  return newUser;
};

const setError = (newError) => {
  return newError;
};

const fetchUserData = ({
  uri,
  id = null,
  email = null,
  password = null,
  firstName = null,
  lastName = null,
}) => {
  return fetch(uri, {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
    }),
  });
};
