let remoteReceiver;
let peerConnection;
let localStream;
let remoteStream;
let turnServers = [];
let iceCandidateQueue = [];

export const setTURNServers = (servers) => {
  turnServers = servers;
};

export const createPeerConnection = async (
  socket,
  sender,
  receiver,
  callType
) => {
  remoteReceiver = receiver;
  // console.log(turnServers);
  // add local stream tracks to peer connection
  localStream = await setLocalMedia(callType);

  peerConnection = new RTCPeerConnection({
    iceServers: [
      {
        url: "stun:stun.services.mozilla.com",
      },
      {
        url: "stun:stun.l.google.com:19302",
      },
      // {
      //   url: "stun:stun.1und1.de:3478",
      // },
      // {
      //   urls: "stun:openrelay.metered.ca:80",
      // },
      // {
      //   urls: "turn:openrelay.metered.ca:80",
      //   username: "openrelayproject",
      //   credential: "openrelayproject",
      // },
      //

      // {
      //   // urls: `turn:${process.env.REACT_APP_TURN_IP}:6581`,
      //   urls: `turn:143.198.122.46:6581`,
      //   username: process.env.REACT_APP_TURN_PASSWORD,
      //   credential: process.env.REACT_APP_TURN_PASSWORD,
      // },

      // {
      //   urls: "turn:openrelay.metered.ca:443",
      //   username: "openrelayproject",
      //   credential: "openrelayproject",
      // },
      // {
      //   urls: "turn:openrelay.metered.ca:80?transport=tcp",
      //   username: "openrelayproject",
      //   credential: "openrelayproject",
      // },
      // {
      //   urls: "turn:openrelay.metered.ca:443?transport=tcp",
      //   username: "openrelayproject",
      //   credential: "openrelayproject",
      // },
      // ...turnServers,
    ],
    // iceTransportPolicy: "relay",
  });

  // send ice candidate
  peerConnection.onicecandidate = (event) => {
    // send local ice candidates to remote
    if (event.candidate) {
      socket.emit("add-ice-candidate", {
        iceCandidate: event.candidate,
        receiver: remoteReceiver,
      });
    }
  };

  // event listener for establishing connection between peers
  peerConnection.onconnectionstatechange = (event) => {
    if (peerConnection.connectionState === "connected") {
      console.log("successfully connected with other peer");
      iceCandidateQueue.forEach((candidate) =>
        peerConnection.addIceCandidate(candidate)
      );
    } else if (peerConnection.connectionState === "disconnected") {
      console.log("other side disconnected");
      handleDisconnect(socket, sender, callType);
    }
  };

  peerConnection.ontrack = (event) => {
    const [newRemoteStream] = event.streams;
    remoteStream = newRemoteStream;
  };

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
};

// invoke on video/voice call button press
export const makeCall = async (socket, sender, receiver, callType) => {
  socket.emit("callRequest", {
    sender,
    receiver,
    callType,
  });
};

// invoke on accept call button press
export const acceptCallRequest = async (socket, sender, receiver, callType) => {
  await createPeerConnection(socket, sender, receiver, callType);

  socket.emit("callAnswer", {
    sender,
    receiver,
    callType,
  });
};

// if callee accepts call, create peer connection and send offer
export const handleAcceptCall = async (
  socket,
  senderEmail,
  receiver,
  callType
) => {
  await createPeerConnection(socket, senderEmail, receiver, callType);

  await makeOffer(socket, senderEmail, remoteReceiver, callType);
};

// make webrtc offer
export const makeOffer = async (socket, senderEmail, receiver, callType) => {
  const offer = await peerConnection.createOffer({
    offerToReceiveAudio: 1,
  });
  await peerConnection.setLocalDescription(offer);

  socket.emit("offer", {
    sender: senderEmail,
    receiver: remoteReceiver,
    offer: offer,
    callType: callType,
  });
};

// handle webrtc offer
export const handleOfferAndSendAnswer = async (
  socket,
  data,
  sender,
  callType
) => {
  if (data.offer) {
    const remoteDescription = new RTCSessionDescription(data.offer);
    await peerConnection.setRemoteDescription(remoteDescription);

    iceCandidateQueue.forEach((candidate) => {
      peerConnection.addIceCandidate(candidate);
    });

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendAnswer(socket, data.sender, answer, data.receiver);
  }
};

// handle webrtc answer
export const handleAnswer = async (data) => {
  await acceptAnswer(null, data);
};

/* ------------------------------------------------------------------------------------------ */

// send answer (helper function)
export const sendAnswer = (socket, receiver, answer, sender) => {
  socket.emit("answer", {
    sender: sender,
    receiver: receiver,
    answer: answer,
  });
};

// reject offer
export const rejectOffer = async (socket, sender, receiver) => {
  socket.emit("reject-offer", {
    sender: sender,
    receiver: receiver,
  });
};

// accept answer from callee
export const acceptAnswer = async (socket, data) => {
  if (data.answer) {
    const remoteDescription = new RTCSessionDescription(data.answer);
    await peerConnection.setRemoteDescription(remoteDescription);

    iceCandidateQueue.forEach((candidate) => {
      peerConnection.addIceCandidate(candidate);
    });
  }
};

// add ice candidate to peer connection
export const addIceCandidate = async (data) => {
  if (data.iceCandidate) {
    if (!peerConnection || !peerConnection.remoteDescription) {
      iceCandidateQueue.push(data.iceCandidate);
    } else {
      // iceCandidateQueue.forEach((iceCandidate) => {
      //   console.log("adding remote ice candidate");
      //   if (iceCandidate) peerConnection.addIceCandidate(iceCandidate);
      // });

      peerConnection.addIceCandidate(data.iceCandidate);
    }
  }
};

// set local video; accepts peer connection from peerConnectionSlice
export const setLocalMedia = async (callType) => {
  // check if user has camera/mic
  let devices = await navigator.mediaDevices.enumerateDevices();
  let hasCam = devices.some((device) => device.kind === "videoinput");
  let hasMic = devices.some((device) => device.kind === "audioinput");

  const localMedia = await navigator.mediaDevices.getUserMedia({
    // video: callType === "VIDEO" ? true : false,
    video: hasCam,
    audio: hasMic,
  });

  if (callType !== "VIDEO" && hasCam) {
    const enabled = localMedia.getVideoTracks()[0].enabled;
    localMedia.getVideoTracks()[0].enabled = false;
  }

  // localMedia.getTracks().forEach((track) => {
  //   peerConnection.addTrack(track, localMedia);
  // });

  return localMedia;
};

export const getLocalStream = () => {
  return localStream;
};

export const getRemoteStream = () => {
  return remoteStream;
};

export const muteStream = () => {
  const enabled = localStream.getAudioTracks()[0].enabled;
  localStream.getAudioTracks()[0].enabled = !enabled;
};

export const hideCam = () => {
  const enabled = localStream.getVideoTracks()[0].enabled;
  localStream.getVideoTracks()[0].enabled = !enabled;
};

// invoke when user presses hang up button
export const hangUp = (socket, sender, receiver, callType) => {
  // reset local stream (enable mic and video)
  localStream.getAudioTracks()[0].enabled = true;
  if (callType === "VIDEO") {
    localStream.getVideoTracks()[0].enabled = true;
  }

  localStream.getAudioTracks().forEach((track) => track.stop());
  localStream.getVideoTracks().forEach((track) => track.stop());
  remoteStream.getAudioTracks().forEach((track) => track.stop());
  remoteStream.getVideoTracks().forEach((track) => track.stop());

  localStream = null;
  remoteStream = null;

  // close peer connection
  peerConnection.close();
  peerConnection.onicecandidate = null;
  peerConnection = null;

  sendEndCallMessage(socket, sender, receiver, callType);
};

// hang up helper
export const sendEndCallMessage = (socket, sender, receiver, callType) => {
  socket.emit("call-ended", {
    sender: sender,
    receiver: receiver,
    callType: callType,
  });
};

export const handleHangUp = (callType) => {
  localStream.getAudioTracks()[0].enabled = true;
  if (callType === "VIDEO") {
    localStream.getVideoTracks()[0].enabled = true;
  }
  localStream.getAudioTracks().forEach((track) => track.stop());
  localStream.getVideoTracks().forEach((track) => track.stop());
  remoteStream.getAudioTracks().forEach((track) => track.stop());
  remoteStream.getVideoTracks().forEach((track) => track.stop());

  localStream = null;
  remoteStream = null;

  peerConnection.close();
  peerConnection.onicecandidate = null;
  peerConnection = null;

  // reset local stream (enable mic and video)

  // do something when remote user disconnects
};

// emit call disconnected event to self when other user unexpectedly disconnects (closed tab, faulty internet, etc.)
export const handleDisconnect = (socket, sender, callType) => {
  socket.emit("handle-disconnect", {
    sender,
    callType,
  });
};
