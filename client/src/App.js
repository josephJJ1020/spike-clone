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

import {
  acceptOffer,
  acceptAnswer,
  addIceCandidate,
  createPeerConnection,
  rejectOffer,
  handlePreOffer,
  getLocalStream,
  getRemoteStream,
  makeOffer,
} from "./controllers/webrtc";

import { AddConversation } from "./components/sidebar/AddConversation";
import { Calling } from "./components/call/Calling";
import { Error } from "./components/call/Error";
import { ReceivingCall } from "./components/call/ReceivingCall";
import { CallScreen } from "./components/call/CallScreen";

import { setUserData } from "./store/slices/userDataSlice";
import { setOnlineUsers } from "./store/slices/onlineUsersSlice";
import {
  replaceConvo,
  setConversations,
} from "./store/slices/conversationsSlice";
import {
  setIsCalling,
  setCallee,
  setErrMsg,
  setReceivingOffer,
  setRemoteCaller,
  setOffer,
  setOnCall,
  setCallType,
  setAccepted,
} from "./store/slices/callStateSlice";

// create socket
const clientSocket = io("http://localhost:3001");

function App() {
  // redux states
  const userDataSlice = useSelector((state) => state.userData);
  const conversationsSlice = useSelector((state) => state.conversations);
  const globalSlice = useSelector((state) => state.global);
  const { errMsg, offer, accepted } = useSelector((state) => state.callState);
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
        // firstName: userDataSlice.userData.firstName,
        // lastName: userDataSlice.userData.lastName,
        email: userDataSlice.userData.email,
      });

      clientSocket.emit("load-conversations", userDataSlice.userData.email); // load conversations of user
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
      ); // should be a conversation object with id, participants, and messages fields
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

    /* --------------------- WebRTC --------------------- */

    clientSocket.on("offer", async (data) => {
      console.log("received offer");
      // make accept reject screen visible when we receive an offer
      // only create answer if we accept the call
      await handlePreOffer(clientSocket, data);
      dispatch(setRemoteCaller(data.sender));
      dispatch(setReceivingOffer(true));
      dispatch(setOffer(data.offer));
      dispatch(setCallType(data.callType));

      // do something with the offer
    });

    clientSocket.on("answer", async (data) => {
      console.log("received answer");
      if (!accepted) {
        await acceptAnswer(clientSocket, data);
        dispatch(setAccepted(true));
        console.log("accepted answer");
        dispatch(setIsCalling(false));
        dispatch(setOnCall(true));
      } else {
        console.log("accepted already");
      }
    });

    clientSocket.on("add-ice-candidate", async (data) => {
      if (data.iceCandidate) {
        try {
          await addIceCandidate(data);
        } catch (err) {
          console.log(err.message);
        }
      }
    });

    clientSocket.on("callee-offline", (receiver) => {
      console.log("callee is offline");
      dispatch(setIsCalling(false));
      dispatch(setErrMsg(`${receiver} is offline`));
      console.log(errMsg);
    });

    clientSocket.on("reject-offer", (rejecter) => {
      console.log("call rejected");
      dispatch(setErrMsg(`${rejecter} rejected your call request.`));
      dispatch(setIsCalling(false));
    });

    return () => {
      clientSocket.off('offer')
      clientSocket.off('answer')
      clientSocket.off('add-ice-candidate')
      clientSocket.off('callee-offline')
      clientSocket.off('reject-offer')
    }
  }, [userDataSlice, dispatch, conversationsSlice, errMsg]);

  const sendMessage = (message) => {
    clientSocket.emit("new-message", {
      user: {
        id: userDataSlice.userId,
        email: userDataSlice.userData.email,
      },
      message: {
        to: globalSlice.receiver, // {id, email}
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

  const createNewConversation = (participants) => {
    clientSocket.emit("create-conversation", participants);
  };

  const videoCall = async (receiver) => {
    dispatch(setCallType("VIDEO"));
    // dispatch(setCallee(receiver));
    dispatch(setIsCalling(true));
    makeOffer(clientSocket, userDataSlice.userData.email, receiver, "VIDEO");
  };

  const voiceCall = async (receiver) => {
    dispatch(setCallType("VOICE"));
    // dispatch(setCallee(receiver));
    dispatch(setIsCalling(true));
    makeOffer(clientSocket, userDataSlice.userData.email, receiver, "VOICE");
  };

  // data.offer, data.receiver
  const acceptCall = async (receiver) => {
    await acceptOffer(
      clientSocket,
      { offer: offer, receiver: receiver },
      userDataSlice.userData.email
    );

    dispatch(setOnCall(true));
  };

  const rejectCall = async (receiver) => {
    await rejectOffer(clientSocket, userDataSlice.userData.email, receiver);
  };

  return (
    <AppContext.Provider
      value={{
        sendMessage,
        sendFriendRequest,
        friendRequestAction,
        createNewConversation,
        videoCall,
        voiceCall,
        acceptCall,
        rejectCall,
      }}
    >
      <Router>
        <main className="App">
          <TopNav />

          <AddConversation />
          <Calling />
          <Error />
          <ReceivingCall />
          <CallScreen />
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
