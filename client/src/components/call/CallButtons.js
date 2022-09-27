import muteButton from "../../images/mic_off.png";
import hideCamButton from "../../images/hide_cam.png";
import unmuteButton from "../../images/mic_on.png";
import showCamButton from "../../images/show_cam.png";

import endCallButton from "../../images/end_call.png";

import { muteStream, hideCam } from "../../controllers/webrtc";

import { useState } from "react";
import { useSelector } from "react-redux";
import { useContext } from "react";

import { AppContext } from "../../context";

import styles from "./Call.module.css";

export function CallButtons() {
  const [muted, setMuted] = useState(false);
  const [offCam, setOffCam] = useState(false);

  const { callType, callee, remoteCaller } = useSelector(
    (state) => state.callState
  );

  const { disconnectFromCall } = useContext(AppContext);

  return (
    <section className={styles.CallButtons}>
      <button
        type="button"
        className={styles.CallButton}
        onClick={() => {
          muteStream();
          setMuted(!muted);
        }}
      >
        <img src={muted ? unmuteButton : muteButton} alt="Mute button" />
      </button>

      <button
        className={styles.EndCall}
        onClick={() => {
          disconnectFromCall(callee ? callee : remoteCaller);
        }}
      >
        <img src={endCallButton} alt="End call" />
      </button>

      {callType === "VIDEO" ? (
        <button
          type="button"
          className={styles.CallButton}
          onClick={() => {
            hideCam();
            setOffCam(!offCam);
          }}
        >
          <img
            src={offCam ? showCamButton : hideCamButton}
            alt="Hide cam button"
          />
        </button>
      ) : null}
    </section>
  );
}
