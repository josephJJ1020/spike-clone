import { useInput } from "../hooks/useInput";
import { useContext, useState } from "react";
import { AppContext } from "../../context";

import videoCallButton from "../../images/video_call.png";
import voiceCallButton from "../../images/voice_call.png";
import attachFile from "../../images/attach_file.png";

import styles from "./Chat.module.css";

export default function MailForm({ participants, receiverEmail }) {
  const { sendMessage, videoCall, voiceCall } = useContext(AppContext);
  const [message, setMessage] = useInput("");
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const submit = (event) => {
    event.preventDefault();

    if (message.value.length) {

      sendMessage(
        message.value,
        uploadedFiles.map((file) => ({ filename: file.name, file: file }))
      ); // receiver and sender will be defined in App.js; this only sends message.content
      setMessage("");
      setUploadedFiles([]);
    }
  };

  const handleFileEvent = (e) => {
    const chosenFiles = Array.prototype.slice.call(e.target.files);
    handleUploadFiles(chosenFiles);
  };

  const handleUploadFiles = (files) => {
    // add files to state
    const uploaded = [...uploadedFiles];

    files.some((file) => {
      if (uploaded.findIndex((f) => f.name === file.name) === -1) {
        uploaded.push(file);
      }
      return true;
    });

    setUploadedFiles(uploaded);
  };

  return (
    <form className="MailForm">
      {!participants || participants.length < 2 ? (
        <div className="Call-Buttons">
          <button
            className={styles.callButton}
            type="button"
            onClick={() => {
              videoCall(receiverEmail);
            }}
          >
            <img src={videoCallButton} alt="Video call button" />
          </button>
          <button
            className={styles.callButton}
            type="button"
            onClick={() => {
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

        <input
          type="file"
          name="fileUpload"
          id="fileUpload"
          multiple
          style={{ display: "none" }}
          onChange={handleFileEvent}
          accept=".png, .jpg, .pdf, .doc, .docx"
        />
        <label htmlFor="fileUpload" className={styles.FileUploadLabel}>
          <a className={styles.FileUploadButton}>
            <img src={attachFile} alt="Upload file" />
          </a>
        </label>
      </div>

      <div className="uploaded-files-list">
        {uploadedFiles && uploadedFiles.map((file) => <div>{file.name}</div>)}
      </div>

      <button className="btn" onClick={submit} type="submit">
        Send Mail
      </button>
    </form>
  );
}
