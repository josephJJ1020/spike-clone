import "./App.css";

import io, { Socket } from "socket.io-client";
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
  makeCall,
  acceptCallRequest,
  handleAcceptCall,
  handleOfferAndSendAnswer,
  handleAnswer,
  addIceCandidate,
  rejectOffer,
  hangUp,
  handleHangUp,
  setTURNServers,
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
  setGettingConversations,
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
const clientSocket = io(process.env.REACT_APP_SOCKET_ORIGIN);

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

  const getTurnServerCredentials = async () => {
    const res = await fetch(process.env.REACT_APP_GET_TURN_CREDENTIALS_ORIGIN);
    const data = await res.json();

    setTURNServers(data.token.iceServers);
  };

  useEffect(() => {
    getTurnServerCredentials();
    // set socket listeners
    clientSocket.on("connect", () => {
      setConnected(true);
    });

    clientSocket.on("onlineUsers", (data) => {
      dispatch(setOnlineUsers(data.filter((user) => user.id !== userId)));
    });

    clientSocket.on("disconnect", () => {
      setConnected(false);
    });

    clientSocket.on("connect_error", () => {
      console.log("can't connect to server");
      setConnected(false);
    });

    clientSocket.on("connect_failed", () => {
      console.log("can't connect to server");
    });

    if (userData) {
      clientSocket.emit("user-connection", {
        id: userId,
        email: userData.email,
      });

      clientSocket.emit("load-conversations", userData.email); // load conversations of user
      dispatch(setGettingConversations(true));
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
      dispatch(
        setConversations(
          data.sort((a, b) => a.identifier.localeCompare(b.identifier))
        )
      ); // should be an array
    });

    clientSocket.on("new-message", (data) => {
      // if convo is currently opened, mark the last message as read by user and emit mark-all-read event
      if (currentConvoId === data._id) {
        if (
          !data.messages[data.messages.length - 1].read.includes(userData.email)
        ) {
          data.messages[data.messages.length - 1].read.push(userData.email);
        }

        clientSocket.emit("mark-all-read", {
          email: userData.email,
          convoId: data._id,
        });
      }
      dispatch(replaceConvo(data)); // replaces current convo with convo with new message
      // need to set currentConvoId as well if the sender receives the new convo
    });

    clientSocket.on("new-conversation", (newConversation) => {
      dispatch(setConversations([...conversations, newConversation])); // should be a conversation object with id, participants, and messages fields
    });

    // load previous 10 messages
    clientSocket.on("lazy-load-conversation", (convo) => {
      dispatch(replaceConvo(convo));
    });

    /* --------------------- WebRTC --------------------- */
    // when user receives a call request
    clientSocket.on("callRequest", (data) => {
      if (onCall) {
        clientSocket.emit("call-unavailable", {
          sender: userData.email,
          receiver: data.sender,
        });
      } else {
        dispatch(setRemoteCaller(data.sender));
        dispatch(setReceivingOffer(true));
        dispatch(setCallType(data.callType));
      }
    });

    // when user's call request is accepted
    clientSocket.on("callAnswer", async (data) => {
      console.log(data.callType);
      await handleAcceptCall(
        clientSocket,
        userData.email,
        data.sender,
        data.callType
      );

      dispatch(setAccepted(true));
      dispatch(setIsCalling(false));
      dispatch(setOnCall(true));
    });

    // when user receives an offer from a caller
    clientSocket.on("offer", async (data) => {
      await handleOfferAndSendAnswer(
        clientSocket,
        data,
        userData.email,
        callType
      );
      dispatch(setOffer(data.offer));
    });

    // if user is the caller and receives and answer
    clientSocket.on("answer", async (data) => {
      // set remote description and set call states
      await handleAnswer(data);
    });

    // when user receives ice candidates, add it to peer connection
    clientSocket.on("add-ice-candidate", async (data) => {
      console.log("received ice candidate from server");
      if (data.iceCandidate) {
        await addIceCandidate(data);
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
      dispatch(setErrMsg(`${data.sender} is unavailable for call.`));
      dispatch(setCallType(null));
    });

    // when other user disconnects not using the end call button (when tab is closed, internet cut off, etc.)
    clientSocket.on("handle-disconnect", (data) => {
      dispatch(setOnCall(false));
      dispatch(setCallee(null));
      dispatch(setErrMsg("Other user disconnected"));
      dispatch(setCallType(null));
      handleHangUp(data.callType);
    });

    return () => {
      // turn off listeners to prevent listeners from emitting the same events multiple times
      clientSocket.off("load-conversations");
      clientSocket.off("new-message");
      clientSocket.off("new-conversation");

      clientSocket.off("callRequest");
      clientSocket.off("callAnswer");
      clientSocket.off("offer");
      clientSocket.off("answer");
      clientSocket.off("add-ice-candidate");
      clientSocket.off("callee-offline");
      clientSocket.off("reject-offer");
      clientSocket.off("call-ended");
      clientSocket.off("handle-disconnect");
    };
  }, [
    userData,
    dispatch,
    conversations,
    errMsg,
    onCall,
    callType,
    currentConvoId,
  ]);

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

      // // send webrtc offer to callee
      // makeOffer(clientSocket, userData.email, receiver, "VIDEO");

      // make call request
      makeCall(clientSocket, userData.email, receiver, "VIDEO");
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

      // make call request
      makeCall(clientSocket, userData.email, receiver, "VOICE");
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
    // accept call
    await acceptCallRequest(clientSocket, userData.email, receiver, callType);

    // set call state
    dispatch(setOnCall(true));
  };

  // reject call
  const rejectCall = async (receiver) => {
    await rejectOffer(clientSocket, userData.email, receiver);
  };

  // lazy load conversation
  const lazyLoadConversation = (convoId, latestLimit) => {
    clientSocket.emit("lazy-load-conversation", { convoId, latestLimit });
  };

  // mark all convo's messages as read
  const markConvoMessagesAsRead = (email, convoId) => {
    clientSocket.emit("mark-all-read", { email, convoId });
  };

  return (
    <AppContext.Provider
      value={{
        sendMessage,
        createNewConversation,
        videoCall,
        voiceCall,
        acceptCall,
        rejectCall,
        disconnectFromCall,
        lazyLoadConversation,
        markConvoMessagesAsRead,
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
