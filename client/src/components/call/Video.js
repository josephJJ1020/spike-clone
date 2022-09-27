import React, { useRef, useEffect } from "react";
import { getLocalStream, getRemoteStream } from "../../controllers/webrtc";
import styles from "./Call.module.css";

export function Video() {
  const localVideoRef = useRef();

  useEffect(() => {
    localVideoRef.current.srcObject = getLocalStream();
  });

  return (
    <video
      ref={localVideoRef}
      className={styles.CallVideo}
      autoPlay
      muted={true}
    ></video>
  );
}

export function RemoteVideo() {
  const remoteVideoRef = useRef();

  useEffect(() => {
    remoteVideoRef.current.srcObject = getRemoteStream();
  });

  return (
    <video ref={remoteVideoRef} className={styles.CallVideo} autoPlay></video>
  );
}
