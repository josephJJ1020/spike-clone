import "./App.css";

import io from "socket.io-client";
import { AppContext } from "./context";
import { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { getAuth } from "./controllers/getAuth";

import TopNav from "./components/nav/TopNav";
import HomePage from "./components/home/HomePage";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import Footer from "./components/nav/Footer";
import PageNotFound from "./components/PageNotFound";
import FlashMessage from "./components/flash/FlashMessage";

// create socket
const clientSocket = io("http://localhost:3001");

function App() {
  const mountedRef = useRef(true);

  const [userId, setUserId] = useState(
    sessionStorage.getItem("userId") === "null"
      ? null
      : sessionStorage.getItem("userId")
  );
  const [currUserData, setCurrUserData] = useState(
    sessionStorage.getItem("userDetails") === "null"
      ? null
      : JSON.parse(sessionStorage.getItem("userDetails"))
  );

  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState({ id: null, socketId: null });

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [conversations, setConversations] = useState([]);

  const [messages, setMessages] = useState([]); // delete later

  const [receiver, setReceiver] = useState(null);
  const [currentConvo, setCurrentConvo] = useState(null);

  const [flashMsg, setFlashMsg] = useState(null);

  useEffect(() => {
    // set socket listeners
    clientSocket.on("connect", () => {
      console.log("connected!");
      setConnected(true);
    });

    clientSocket.on("onlineUsers", (data) => {
      setOnlineUsers(data.filter((user) => user.id !== userId)); // should be an array of user objects with id and socketId
    });

    clientSocket.on("disconnect", () => {});

    if (currUserData) {
      clientSocket.emit("user-connection", {
        id: userId,
        firstName: currUserData.firstName,
        lastName: currUserData.lastName,
      });
      clientSocket.emit("load-conversations", userId); // load conversations of user
    }

    return () => {
      // remove listeners in cleanup in order to prevent multiple event registrations
      clientSocket.off("connect");
      clientSocket.off("onlineUsers");
      clientSocket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    clientSocket.on("load-conversations", (data) => {
      setConversations(data); // should be an array
    });

    clientSocket.on("new-message", (data) => {
      const newConversations = [...conversations, data];
      setConversations(newConversations);
    });

    clientSocket.on("new-conversation", (newConversation) => {
      setConversations([...conversations, newConversation]); // should be a conversation object with id, participants, and messages keys
    });

    clientSocket.on("friend-request", (data) => {
      console.log(data);

      if (currUserData) {
        const newNotifications = [...currUserData.notifications, data];

        sessionStorage.setItem(
          "userDetails",
          JSON.stringify({ ...currUserData, notifications: newNotifications })
        );

        setCurrUserData(JSON.parse(sessionStorage.getItem("userDetails")));
      }
    });

    // receives new array of notifications
    clientSocket.on("accept-friend-request", (data) => {
      console.log(data);
      // check if there is data sent

      if (data) {
        if (currUserData) {
          // replace user notifications in session storage
          sessionStorage.setItem(
            "userDetails",
            JSON.stringify({
              ...currUserData,
              notifications: data.notifications,
              friends: data.friends,
            })
          );

          setCurrUserData(JSON.parse(sessionStorage.getItem("userDetails")));
        }
      }
    });

    clientSocket.on("reject-friend-request", (data) => {
      console.log(data);
      // check if there is data sent

      if (data) {
        if (currUserData) {
          // replace user notifications in session storage
          sessionStorage.setItem(
            "userDetails",
            JSON.stringify({
              ...currUserData,
              notifications: data.notifications,
            })
          );

          setCurrUserData(JSON.parse(sessionStorage.getItem("userDetails")));
        }
      }
    });

    if (currUserData) {
      console.log(currUserData.notifications);
    }
  }, [messages, conversations, connected, currUserData]);

  const sendMessage = (message) => {
    clientSocket.emit("new-message", {
      user: {
        id: userId,
      },
      message: {
        to: receiver,
        content: message,
      },
      convoId: null,
    });
  };

  const signUp = async (email, password, firstName, lastName) => {
    const userData = await getAuth({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      action: "SIGNUP",
    });
    if (userData.error) {
      setFlashMsg({ type: "error", message: userData.error.message });
      return;
    } else if (userData) {
      sessionStorage.setItem("userId", userData.userData.user._id);
      sessionStorage.setItem(
        "userDetails",
        JSON.stringify(userData.userData.user)
      );
      window.location.reload();
    }
  };

  const logIn = async (formEmail, formPassword) => {
    const userData = await getAuth({
      email: formEmail,
      password: formPassword,
      action: "LOGIN",
    });

    if (userData.error) {
      setFlashMsg({ type: "error", message: userData.error.message });
      return;
    } else if (userData) {
      sessionStorage.setItem("userId", userData.userData.user._id);
      sessionStorage.setItem(
        "userDetails",
        JSON.stringify(userData.userData.user)
      );
      window.location.reload();
    }
  };

  const logOut = () => {
    sessionStorage.setItem("userId", null);
    sessionStorage.setItem("userDetails", null);
    window.location.reload();
  };

  const sendFriendRequest = (requesterId, receiverId) => {
    clientSocket.emit("friend-request", {
      requesterId: requesterId,
      receiverId: receiverId,
    });
  };

  const friendRequestAction = (data) => {
    console.log("friend request action");
    clientSocket.emit("friend-request-action", data);
  };

  return (
    <AppContext.Provider
      value={{
        userData: currUserData,
        userId,
        receiver,
        messages,
        conversations,
        setMessages,
        setReceiver,
        onlineUsers,
        sendMessage,
        signUp,
        logIn,
        logOut,
        flashMsg,
        setFlashMsg,
        currentConvo,
        setCurrentConvo,
        sendFriendRequest,
        friendRequestAction,
      }}
    >
      <Router>
        <main className="App">
          <TopNav />
          {flashMsg && <FlashMessage />}
          <Routes>
            <Route
              path="/"
              element={userId ? <HomePage /> : <Navigate to="/login" />}
            />
            <Route
              path="/login"
              element={userId ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/signup"
              element={userId ? <Navigate to="/" /> : <SignUp />}
            />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Footer />
        </main>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
