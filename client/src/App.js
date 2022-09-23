import "./App.css";

import io from "socket.io-client";
import { AppContext } from "./context";
import { useEffect, useState } from "react";
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

import { AddConversation } from "./components/sidebar/AddConversation";

import { setUserData } from "./store/slices/userDataSlice";
import { setOnlineUsers } from "./store/slices/onlineUsersSlice";
import {
  replaceConvo,
  setConversations,
} from "./store/slices/conversationsSlice";

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
      dispatch(replaceConvo(data)); // replaces current convo with convo with new message
    });

    clientSocket.on("new-conversation", (newConversation) => {
      console.log("received new conversation");
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
  }, [userDataSlice, dispatch, conversationsSlice]);

  const sendMessage = (message) => {
    clientSocket.emit("new-message", {
      user: {
        id: userDataSlice.userId,
        firstName: userDataSlice.userData.firstName,
        lastName: userDataSlice.userData.lastName,
      },
      message: {
        to: globalSlice.receiver, // {id, firstName, lastName}
        content: message,
      },
      convoId: globalSlice.currentConvoId,
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

  return (
    <AppContext.Provider
      value={{ sendMessage, sendFriendRequest, friendRequestAction }}
    >
      <Router>
        <main className="App">
          <TopNav />

          <AddConversation />
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
            <Route path="/spike-clone" element={<Navigate to="/" />}></Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          <Footer />
        </main>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
