import React from "react";
import { AppContext } from "../../context";
import { useContext } from "react";
import styles from './Chat.module.css'

export default function ChatHeader() {
  const {receiver, currentConvo} = useContext(AppContext)
  return (
    <div className="ChatHeader">
      {
        receiver ? <><div className="Subject">
        <h1>{receiver ? receiver.id : `Select receiver`}</h1>
      </div>

      <div>
        <p>Other receivers</p>
      </div></>
      : currentConvo ? <>
      <div className={styles.Subject}>
        <p>{currentConvo.participants.join(", ")}</p>
      </div>
      </>:`Select a receiver`
      }
      
    </div>
  );
}
