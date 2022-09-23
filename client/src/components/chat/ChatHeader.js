import React from "react";
import { useSelector } from "react-redux";

import styles from "./Chat.module.css";

export default function ChatHeader() {
  const {global} = useSelector(state => state.global)
  
  return (
    <div className="ChatHeader">
      {global.receiver ? (
        <>
          <div className="Subject">
            <h1>{global.receiver ? global.receiver.id : `Select receiver`}</h1>
          </div>

          <div>
            <p>Other receivers</p>
          </div>
        </>
      ) : global.currentConvo ? (
        <>
          <div className={styles.Subject}>
            <p>{global.currentConvo.participants.join(", ")}</p>
          </div>
        </>
      ) : (
        `Select a receiver`
      )}
    </div>
  );
}
