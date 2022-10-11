import React, { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

import { getLocalStream, getRemoteStream } from "../../controllers/webrtc";
import styles from "./Call.module.css";

export function Video() {
  const localVideoRef = useRef();

  useEffect(() => {
    localVideoRef.current.srcObject = getLocalStream();
  });

  return (
    <section>
      <video
        ref={localVideoRef}
        className={styles.CallVideo}
        autoPlay
        muted={true}
       
      ></video>
      <p>You</p>
    </section>
  );
}

export function RemoteVideo() {
  const { remoteCaller, callee } = useSelector(
    (state) => state.callState
  );
  const remoteVideoRef = useRef();

  useEffect(() => {
    remoteVideoRef.current.srcObject = getRemoteStream();
  });

  return (
    <section>
      <video
        ref={remoteVideoRef}
        className={styles.CallVideo}
        autoPlay
        
      ></video>

      <p>{callee ? callee : remoteCaller}</p>
    </section>
  );
}
