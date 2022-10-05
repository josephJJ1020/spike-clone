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
  rejectOffer,
  handlePreOffer,
  makeOffer,
  hangUp,
  handleHangUp,
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
import { LandingPage } from "./components/home/LandingPage";

// create socket
const clientSocket = io("http://localhost:3001");

function App() {
  // redux states
  const { userData, userId } = useSelector((state) => state.userData);
  const { conversations } = useSelector((state) => state.conversations);
  const { receiver, currentConvoId, flashMsg } = useSelector(
    (state) => state.global
  );
  const { errMsg, offer, onCall, callType } = useSelector(
    (state) => state.callState
  );
  const dispatch = useDispatch();

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // set socket listeners
    clientSocket.on("connect", () => {
      setConnected(true);
    });

    clientSocket.on("onlineUsers", (data) => {
      dispatch(setOnlineUsers(data.filter((user) => user.id !== userId))); // should be an array of user objects with id and socketId
    });

    clientSocket.on("disconnect", () => {
      setConnected(false);
    });

    if (userData) {
      clientSocket.emit("user-connection", {
        id: userId,
        // firstName: userDataSlice.userData.firstName,
        // lastName: userDataSlice.userData.lastName,
        email: userData.email,
      });

      clientSocket.emit("load-conversations", userData.email); // load conversations of user
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
      // need to set currentConvoId as well if the sender receives the new convo
    });

    clientSocket.on("new-conversation", (newConversation) => {
      dispatch(setConversations([...conversations, newConversation])); // should be a conversation object with id, participants, and messages fields
    });

    // when user receives a friend request
    clientSocket.on("friend-request", (data) => {
      if (userData) {
        const newNotifications = [...userData.notifications, data];

        // add friend request notification to user's notifications and store new userData in session storage
        sessionStorage.setItem(
          "userDetails",
          JSON.stringify({
            ...userData,
            notifications: newNotifications,
          })
        );

        // replace current user data with new user data
        dispatch(
          setUserData(JSON.parse(sessionStorage.getItem("userDetails")))
        );
      }
    });

    // receives new array of notifications
    clientSocket.on("accept-friend-request", (data) => {
      // check if there is data sent
      if (data) {
        if (userData) {
          // replace user notifications in session storage
          sessionStorage.setItem(
            "userDetails",
            JSON.stringify({
              ...userData,
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

    // when user's friend request is rejected
    clientSocket.on("reject-friend-request", (data) => {
      // check if there is data sent
      if (data) {
        if (userData) {
          // replace user notifications in session storage
          sessionStorage.setItem(
            "userDetails",
            JSON.stringify({
              ...userData,
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

    // when user receives an offer from a caller
    clientSocket.on("offer", async (data) => {
      // if user is on call, emit call-unavailable event to caller
      if (onCall) {
        clientSocket.emit("call-unavailable", {
          sender: userData.email,
          receiver: data.sender,
        });
      } else {
        // set remote description and set call states
        await handlePreOffer(clientSocket, data);
        dispatch(setRemoteCaller(data.sender));
        dispatch(setReceivingOffer(true));
        dispatch(setOffer(data.offer));
        dispatch(setCallType(data.callType));
      }
    });

    // if user is the caller and receives and answer
    clientSocket.on("answer", async (data) => {
      // set remote description and set call states
      await acceptAnswer(clientSocket, data);

      dispatch(setAccepted(true));
      dispatch(setIsCalling(false));
      dispatch(setOnCall(true));
    });

    // when user receives ice candidates, add it to peer connection
    clientSocket.on("add-ice-candidate", async (data) => {
      if (data.iceCandidate) {
        try {
          await addIceCandidate(data);
        } catch (err) {
          console.log(err.message);
        }
      }
    });

    // when user is the caller and user's call request is rejected
    clientSocket.on("reject-offer", (rejecter) => {
      // display modal saying that user's call is rejected; set call state
      dispatch(setErrMsg(`${rejecter} rejected your call request.`));
      dispatch(setIsCalling(false));
    });

    // when remote connection ends the call
    clientSocket.on("call-ended", (data) => {
      // close peer connection; display modal saying remote connection has ended the call; set call states
      dispatch(setErrMsg(`${data.sender} has ended the call.`));
      dispatch(setOnCall(false));
      handleHangUp(data.callType);
      dispatch(setCallType(null));
    });

    // when user is calling an offline user
    clientSocket.on("callee-offline", (receiver) => {
      // set call states; display modal saying remote user is offline
      dispatch(setIsCalling(false));
      dispatch(setErrMsg(`${receiver} is offline`));
    });

    // when user calls remote connection but is remote is currently in a call
    clientSocket.on("call-unavailable", (data) => {
      // set call states; display modal saying remote is currently unavailable
      dispatch(setIsCalling(false));
      dispatch(setCallee(null));
      dispatch(setErrMsg(`${data.sender} is currently unavailable.`));
      dispatch(setCallType(null));
    });

    return () => {
      // turn off listeners to prevent listeners from emitting the same events multiple times
      clientSocket.off("load-conversations");
      clientSocket.off("new-message");
      clientSocket.off("new-conversation");
      clientSocket.off("friend-request");
      clientSocket.off("accept-friend-request");
      clientSocket.off("reject-friend-request");

      clientSocket.off("offer");
      clientSocket.off("answer");
      clientSocket.off("add-ice-candidate");
      clientSocket.off("callee-offline");
      clientSocket.off("reject-offer");
      clientSocket.off("call-ended");
    };
  }, [userData, dispatch, conversations, errMsg, onCall]);

  // send new message to conversation
  const sendMessage = (message, files) => {
    clientSocket.emit("new-message", {
      user: {
        id: userId,
        email: userData.email,
      },
      message: {
        to: [receiver], // {id, email}
        content: message,
      },
      convoId: currentConvoId,
      files: files,
    });
  };

  // send friend request
  const sendFriendRequest = (requesterId, receiverId) => {
    clientSocket.emit("friend-request", {
      requesterId: requesterId,
      receiverId: receiverId,
    });
  };

  // handle friend request
  const friendRequestAction = (data) => {
    clientSocket.emit("friend-request-action", data);
  };

  // create new conversation (TODO: should take in subject and conversation name as well)
  const createNewConversation = (participants) => {
    clientSocket.emit("create-conversation", participants);
  };

  // when user starts a video call (only 1 to 1 video call)
  const videoCall = async (receiver) => {
    // if statement to avoid sending a call request to self
    if (receiver !== userData.email) {
      // set call states
      dispatch(setCallType("VIDEO"));
      dispatch(setCallee(receiver));
      dispatch(setIsCalling(true));

      // send webrtc offer to callee
      makeOffer(clientSocket, userData.email, receiver, "VIDEO");
    }
  };

  // when user starts a voice call (only 1 to 1 voice call)
  const voiceCall = async (receiver) => {
    // if statement to avoid sending a call request to self
    if (receiver !== userData.email) {
      // set call states
      dispatch(setCallType("VOICE"));
      dispatch(setCallee(receiver));
      dispatch(setIsCalling(true));

      // send webrtc offer to callee
      makeOffer(clientSocket, userData.email, receiver, "VOICE");
    }
  };

  // initiate call disconnection
  const disconnectFromCall = async (receiver) => {
    // send disconnect message to remote
    hangUp(clientSocket, userData.email, receiver, callType);

    // set call states; display modal saying that call has been disconnected
    dispatch(setErrMsg("Call has been disconnected"));
    dispatch(setOnCall(false));
    dispatch(setCallType(null));
  };

  // when user wants to accept call offer from remote
  const acceptCall = async (receiver) => {
    // set remote description
    await acceptOffer(
      clientSocket,
      { offer: offer, receiver: receiver },
      userData.email
    );

    // set call state
    dispatch(setOnCall(true));
  };

  //
  const rejectCall = async (receiver) => {
    await rejectOffer(clientSocket, userData.email, receiver);
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
        disconnectFromCall,
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
          {flashMsg && <FlashMessage />}

          <Routes>
            <Route path="/" element={userId ? <HomePage /> : <LandingPage />} />
            <Route
              path="/login"
              element={userId ? <Navigate to="/" /> : <Login />}
            />
            <Route
              path="/signup"
              element={userId ? <Navigate to="/" /> : <SignUp />}
            />
            <Route path="/spike-clone" element={<Navigate to="/" />}></Route>
            <Route path="*" element={<PageNotFound />} />
          </Routes>
          {!userId ? <Footer /> : null}
        </main>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
