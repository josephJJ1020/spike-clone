import validator from "email-validator";

// use to get user data from the server
export const getAuth = async ({
  id = null,
  email,
  password,
  appPassword = null,
  emailService = null,
  inboundHost = null,
  inboundPort = null,
  outboundHost = null,
  outboundPort = null,
  action,
}) => {
  let userData = {
    id: null,
    email: null,
    password: null,
    appPassword: null,
    emailService: null,
    inboundHost: null,
    inboundPort: null,
    outboundHost: null,
    outboundPort: null,
  };

  let error = null;

  if (
    [id, email, inboundHost, inboundPort, outboundHost, outboundPort].every(
      (item) => !item
    )
  ) {
    error = setError(new Error("Please provide credentials"));
    return { userData, error };
  }

  if (action === "LOGIN") {
    if (!id && !email) {
      error = setError(new Error("Please provide credentials"));
      return { userData, error };
    }

    if ((email && !password) || (!email && password)) {
      error = setError(new Error("Please complete login credentials"));
      return { userData, error };
    }
  }

  if (
    action === "SIGNUP" &&
    (!email || !password || !inboundHost || !inboundPort)
  ) {
    error = setError(new Error("Incomplete signup credentials."));
    return { userData, error };
  }

  if (!validator.validate(email)) {
    error = setError(new Error("Invalid email."));
    return { userData, error };
  }

  if (emailService === "GMAIL" && !appPassword) {
    error = setError(
      new Error("Please provide app password for Gmail service.")
    );
    return { userData, error };
  }

  switch (action) {
    case "LOGIN":
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
            user,
          });
        })
        .catch((err) => (error = setError(new Error("Unable to find user."))));

      break;

    case "SIGNUP":
      await fetchUserData({
        uri: process.env.REACT_APP_SIGNUP_URI,
        email: email,
        password: password,
        appPassword: appPassword,
        emailService: emailService,
        inboundHost: inboundHost,
        inboundPort: inboundPort,
        outboundHost: outboundHost,
        outboundPort: outboundPort,
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
  appPassword = null,
  emailService = null,
  inboundHost = null,
  inboundPort = null,
  outboundHost = null,
  outboundPort = null,
}) => {
  return fetch(uri, {
    method: "POST",
    mode: "cors",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      email,
      password,
      appPassword,
      emailService,
      inboundHost,
      inboundPort,
      outboundHost,
      outboundPort,
    }),
  });
};
