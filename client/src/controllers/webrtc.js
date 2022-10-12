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
  // console.log(turnServers);
  peerConnection = new RTCPeerConnection({
    iceServers: [
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

      {
        urls: `turn:${process.env.REACT_APP_TURN_IP}:6581`,
        username: process.env.REACT_APP_TURN_PASSWORD,
        credential: process.env.REACT_APP_TURN_PASSWORD,
      },

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
  remoteReceiver = receiver;

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
    } else if (peerConnection.connectionState === "disconnected") {
      // remove remote video/reset callee
    }
  };

  peerConnection.ontrack = (event) => {
    const [newRemoteStream] = event.streams;
    remoteStream = newRemoteStream;
  };

  // add local stream tracks to peer connection
  localStream = await setLocalMedia(callType);
};

// make offer; invoke when video call button is pressed; send to receiver, which is an email (will send if receiver is in online users)
export const makeOffer = async (socket, senderEmail, receiver, callType) => {
  await createPeerConnection(socket, senderEmail, receiver, callType);
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  socket.emit("offer", {
    sender: senderEmail,
    receiver: remoteReceiver,
    offer: offer,
    callType: callType,
  });
};

export const handlePreOffer = async (socket, data) => {
  await createPeerConnection(socket, null, data.sender, data.callType);
  const remoteDescription = new RTCSessionDescription(data.offer);
  await peerConnection.setRemoteDescription(remoteDescription);
};

// creating answer after receiving offer from caller
// only call this function only if we accept caller's offfer (when user presses accept call)
export const acceptOffer = async (socket, data, sender) => {
  if (data.offer) {
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    sendAnswer(socket, data.receiver, answer, sender);
  }
};

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
  if (peerConnection.signalingState !== "stable") {
    const remoteDescription = new RTCSessionDescription(data.answer);
    await peerConnection.setRemoteDescription(remoteDescription);
  }
};

// add ice candidate to peer connection
export const addIceCandidate = async (data) => {
  if (data.iceCandidate) {
    if (!peerConnection || !peerConnection.remoteDescription) {
      iceCandidateQueue.push(data.iceCandidate);
    } else {
      iceCandidateQueue.forEach((iceCandidate) => {
        if (iceCandidate) peerConnection.addIceCandidate(iceCandidate);
      });
    }
  }
};

// set local video; accepts peer connection from peerConnectionSlice
export const setLocalMedia = async (callType) => {
  const localMedia = await navigator.mediaDevices.getUserMedia({
    // video: callType === "VIDEO" ? true : false,
    video: true,
    audio: true,
  });

  if (callType !== "VIDEO") {
    const enabled = localMedia.getVideoTracks()[0].enabled;
    localMedia.getVideoTracks()[0].enabled = false;
  }

  localMedia.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localMedia);
  });

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
