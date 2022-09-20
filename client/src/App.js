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

// create socket
const clientSocket = io("http://localhost:3001");

function App() {
  const mountedRef = useRef(true);

  const [userId, setUserId] = useState(
    sessionStorage.getItem("userId") === "null"
      ? null
      : sessionStorage.getItem("userId")
  );
  console.log(userId);
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

  useEffect(() => {
    console.log(userId);
    console.log(typeof userId);
    // console.log(currUserData.userData.email)

    console.log(`currUserData: ${currUserData}`);

    // set socket listeners
    clientSocket.on("connect", () => {
      console.log("connected!");
      setConnected(true);
    });

    clientSocket.on("onlineUsers", (data) => {
      setOnlineUsers(data); // should be an array of user objects with id and socketId
    });

    clientSocket.on("disconnect", () => {});
    return () => {
      // remove listeners in cleanup in order to prevent multiple event registrations
      clientSocket.off("connect");
      clientSocket.off("onlineUsers");
      clientSocket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    clientSocket.on("load-conversations", (data) => {
      console.log("received conversations!");
      setConversations(data); // should be an array
    });

    clientSocket.on("new-message", (data) => {
      // // should be obejct with convoId and msg keys
      // let conversation = conversations.find(
      //   (convo) => convo.id === data.convoId
      // );

      // if (conversation) {
      //   conversation.messages.push(data.msg);

      //   // update conversation in conversations list
      //   setConversations(
      //     conversations.map((convo) =>
      //       convo.id === data.convoId ? conversation : { ...convo }
      //     )
      //   );
      // } else {
      //   console.log(`can't find conversation with id ${data.convoId}`);
      // }
      console.log(messages);
      const newMessages = [...messages, data];
      setMessages(newMessages);
    });

    clientSocket.on("new-conversation", (newConversation) => {
      setConversations([...conversations, newConversation]); // should be a conversation object with id, participants, and messages keys
    });

    console.log(`connected: ${connected}`);
  }, [messages, conversations, connected]);

  useEffect(() => {
    if (mountedRef.current) {
      mountedRef.current = false;
    } else {
      clientSocket.emit("user-connection", userId); // add user to online users in backend
      console.log("emitting user-connection event");
      clientSocket.emit("load-conversations", userId); // load conversations of user
    }
  }, [userId]);

  useEffect(() => {
    if (mountedRef.current) {
      mountedRef.current = false;
    } else {
      console.log(currUserData);
    }
  }, [currUserData]);

  const sendMessage = (message) => {
    clientSocket.emit("new-message", message);
  };

  const signUp = async (email, password, firstName, lastName) => {
    const userData = await getAuth({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      action: "SIGNUP",
    });
    if (userData.userData.id) {
      sessionStorage.setItem("userId", userData.userData.id);
      sessionStorage.setItem("userDetails", userData.userData);
    }
    window.location.reload();
  };

  const logIn = async (formEmail, formPassword) => {
    const userData = await getAuth({
      email: formEmail,
      password: formPassword,
      action: "LOGIN",
    });
    if (userData.userData.id) {
      sessionStorage.setItem("userId", userData.userData.id);
      sessionStorage.setItem("userDetails", JSON.stringify(userData.userData));
    }
    window.location.reload();
  };

  const logOut = () => {
    sessionStorage.setItem("userId", null);
    sessionStorage.setItem("userDetails", null);
    window.location.reload();
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
      }}
    >
      <Router>
        <main className="App">
          <TopNav />
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
