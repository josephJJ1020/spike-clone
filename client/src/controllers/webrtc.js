/* 

clientId: socket id; // maybe make this user email
receiver: email (will search for user's socket id in onlineUsers array in server;

*/

// create peer connection; invoke only video call button is pressed (along with makeoffer function)
// call inside setPeerConnection reducer

/*
USAGE: 
if (video_call) {
  makeOffer(pc, socket, clientId, receiver (email))
  // maybe setLocalVideo() as well
}
*/
export const createPeerConnection = async (
  socket,
  sender,
  receiver,
  callType
) => {
  console.log(callType)
  const pc = new RTCPeerConnection();

  pc.onicecandidate = (event) => {
    // send local ice candidates to remote
    if (event.candidate) {
      //   client.emit("add-ice-candidate", {
      //     iceCandidate: event.candidate,
      //     receiver: receiverId,
      //   });
    }
  };

  // listen for remote stream
  pc.ontrack = (event) => {
    const [remoteStream] = event.streams;
    // remoteVideo.srcObject = remoteStream;
  };

  await setLocalMedia(pc, callType);
  await makeOffer(pc, socket, sender, receiver, callType);
};

// make offer; invoke when video call button is pressed; send to receiver, which is an email (will send if receiver is in online users)
export const makeOffer = async (
  pc,
  socket,
  senderEmail,
  receiver,
  callType
) => {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  socket.emit("offer", {
    sender: senderEmail,
    receiver: receiver,
    offer: offer,
    callType: callType,
  });
};

// creating answer after receiving offer from caller
// there has to be some sort of accept/reject logic here

// i.e. only call this function only if we accept caller's offfer (when user presses accept call)
export const createAnswer = async (socket, data, pc, clientId) => {
  if (data.offer) {
    const remoteDescription = new RTCSessionDescription(data.offer);
    pc.setRemoteDescription(remoteDescription);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    sendAnswer(socket, data, answer, clientId);
  }
};

// reject offer
export const rejectOffer = async (socket, sender, receiver) => {
  socket.emit("reject-offer", {
    sender: sender,
    receiver: receiver,
  });
};

// send answer (helper function)
export const sendAnswer = (socket, data, answer, clientId) => {
  socket.emit("answer", {
    sender: clientId,
    receiver: data.sender,
    answer,
  });
};

// accept answer from callee
export const acceptAnswer = async (data, pc) => {
  if (data.answer) {
    const remoteDescription = new RTCSessionDescription(data.answer);
    await pc.setRemoteDescription(remoteDescription);
  }
};

// add ice candidate to peer connection
export const addIceCandidate = async (data, pc) => {
  if (data.iceCandidate) {
    await pc.addIceCandidate(data.iceCandidate);
  }
};

// set local video; accepts peer connection from peerConnectionSlice
export const setLocalMedia = async (pc, callType) => {
  const localMedia = await navigator.mediaDevices.getUserMedia({
    video: callType === "VIDEO" ? true : false,
    audio: true,
  });

  localMedia.getTracks().forEach((track) => {
    pc.addTrack(track, localMedia);
  });
  // localVideo.srcObject = localMedia;
  return localMedia;
};

/* TODO: create function for only voice call */
