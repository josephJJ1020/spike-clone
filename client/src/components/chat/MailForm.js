import { useInput } from "../hooks/useInput";
import { useContext } from "react";
import { AppContext } from "../../context";

import videoCallButton from "../../images/video_call.png";
import voiceCallButton from "../../images/voice_call.png";

import styles from "./Chat.module.css";

export default function MailForm({ participants, receiverEmail }) {
  const { sendMessage, videoCall, voiceCall } = useContext(AppContext);
  const [message, setMessage] = useInput("");

  const submit = (event) => {
    event.preventDefault();

    if (message.value.length) {
      sendMessage(message.value); // receiver and sender will be defined in App.js; this only sends message.content
      setMessage("");
    }
  };

  return (
    <form className="MailForm">
      {!participants ||  participants.length < 2 ? (
        <div className="Call-Buttons">
          <button
            className={styles.callButton}
            type="button"
            onClick={() => {
              console.log("making video call");
              videoCall(receiverEmail);
            }}
          >
            <img src={videoCallButton} alt="Video call button" />
          </button>
          <button
            className={styles.callButton}
            type="button"
            onClick={() => {
              console.log("making video call");
              voiceCall(receiverEmail);
            }}
          >
            <img src={voiceCallButton} alt="Voice call button" />
          </button>
        </div>
      ) : null}

      <div className="Msg-Form">
        <input
          type={"text"}
          className="form-control shadow-none"
          {...message}
          placeholder="Type message here"
        />
      </div>

      <button className="btn" onClick={submit} type="submit">
        Send Mail
      </button>
    </form>
  );
}
