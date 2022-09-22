import "./App.css";

import io from "socket.io-client";
import { AppContext } from "./context";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import TopNav from "./components/nav/TopNav";
import HomePage from "./components/home/HomePage";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import Footer from "./components/nav/Footer";
import PageNotFound from "./components/PageNotFound";
import FlashMessage from "./components/flash/FlashMessage";

import { setUserData } from "./store/slices/userDataSlice";
import { setOnlineUsers } from "./store/slices/onlineUsersSlice";
import { setConversations } from "./store/slices/conversationsSlice";

// create socket
const clientSocket = io("http://localhost:3001");

function App() {
  // redux states
  const userDataSlice = useSelector((state) => state.userData);
  const conversationsSlice = useSelector((state) => state.conversations);
  const globalSlice = useSelector((state) => state.global);
  const dispatch = useDispatch();

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // set socket listeners
    clientSocket.on("connect", () => {
      console.log("connected!");
      setConnected(true);
    });

    clientSocket.on("onlineUsers", (data) => {
      dispatch(
        setOnlineUsers(data.filter((user) => user.id !== userDataSlice.userId))
      ); // should be an array of user objects with id and socketId
    });

    clientSocket.on("disconnect", () => {});

    if (userDataSlice.userData) {
      clientSocket.emit("user-connection", {
        id: userDataSlice.userId,
        firstName: userDataSlice.userData.firstName,
        lastName: userDataSlice.userData.lastName,
      });

      clientSocket.emit("load-conversations", userDataSlice.userId); // load conversations of user
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
      dispatch(setConversations(data)); // should be an array
    });

    clientSocket.on("new-message", (data) => {
      const newConversations = [...conversationsSlice.conversations, data];
      dispatch(setConversations(newConversations));
    });

    clientSocket.on("new-conversation", (newConversation) => {
      dispatch(
        setConversations([...conversationsSlice.conversations, newConversation])
      ); // should be a conversation object with id, participants, and messages keys
    });

    clientSocket.on("friend-request", (data) => {
      console.log(data);

      if (userDataSlice.userData) {
        const newNotifications = [
          ...userDataSlice.userData.notifications,
          data,
        ];

        sessionStorage.setItem(
          "userDetails",
          JSON.stringify({
            ...userDataSlice.userData,
            notifications: newNotifications,
          })
        );

        dispatch(
          setUserData(JSON.parse(sessionStorage.getItem("userDetails")))
        );
      }
    });

    // receives new array of notifications
    clientSocket.on("accept-friend-request", (data) => {
      console.log(data);
      // check if there is data sent

      if (data) {
        if (userDataSlice.userData) {
          // replace user notifications in session storage
          sessionStorage.setItem(
            "userDetails",
            JSON.stringify({
              ...userDataSlice.userData,
              notifications: data.notifications,
              friends: data.friends,
            })
          );
          dispatch(
            setUserData(JSON.parse(sessionStorage.getItem("userDetails")))
          );
        }
      }
    });

    clientSocket.on("reject-friend-request", (data) => {
      console.log(data);
      // check if there is data sent

      if (data) {
        if (userDataSlice.userData) {
          // replace user notifications in session storage
          sessionStorage.setItem(
            "userDetails",
            JSON.stringify({
              ...userDataSlice.userData,
              notifications: data.notifications,
            })
          );
          dispatch(
            setUserData(JSON.parse(sessionStorage.getItem("userDetails")))
          );
        }
      }
    });

    if (userDataSlice.userData) {
      console.log(userDataSlice.userData.notifications);
    }
  }, [userDataSlice, dispatch, conversationsSlice]);

  const sendMessage = (message) => {
    clientSocket.emit("new-message", {
      user: {
        id: userDataSlice.userId,
      },
      message: {
        to: globalSlice.receiver,
        content: message,
      },
      convoId: null,
    });
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

  console.log(userDataSlice);
  /*<AppContext.Provider
      value={{
        sendMessage, // controller
        sendFriendRequest, // controller
        friendRequestAction, // controller
      }}
    > */
  return (
    <AppContext.Provider
      value={{ sendMessage, sendFriendRequest, friendRequestAction }}
    >
      <Router>
        <main className="App">
          <TopNav />
          {globalSlice.flashMsg && <FlashMessage />}
          <Routes>
            <Route
              path="/"
              element={
                userDataSlice.userId ? <HomePage /> : <Navigate to="/login" />
              }
            />
            <Route
              path="/login"
              element={userDataSlice.userId ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/signup"
              element={userDataSlice.userId ? <Navigate to="/" /> : <SignUp />}
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
