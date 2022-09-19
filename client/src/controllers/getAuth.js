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

  if (!id && !email) {
    console.log("no id or email");
    error = setError(new Error("Please provide user ID or email"));
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
          userData = setUser({
            id: user.id,
            email: user.email,
            firstName: user.first,
            lastName: user.lastName,
            password: user.password,
          });
        })
        .catch((err) => (error = setError(err)));

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
          userData = setUser({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            password: user.password,
            friends: user.friends,
          });
        })
        .catch((err) => (error = setError(err)));
      break;

    default:
      fetchUserData({uri: process.env.REACT_APP_LOGIN_URI, id: id})
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
        .catch((err) => setError(err));
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
