import muteButton from "../../images/mic_off.png";
import hideCamButton from "../../images/hide_cam.png";
import unmuteButton from "../../images/mic_on.png";
import showCamButton from "../../images/show_cam.png";

import { muteStream, hideCam } from "../../controllers/webrtc";

import { useState } from "react";
import { useSelector } from "react-redux";

import styles from "./Call.module.css";

export function CallButtons() {
  const [muted, setMuted] = useState(false);
  const [offCam, setOffCam] = useState(false);

  const { callType } = useSelector((state) => state.callState);

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
