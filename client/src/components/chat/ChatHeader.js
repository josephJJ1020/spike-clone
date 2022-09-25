import React from "react";
import { useSelector } from "react-redux";

import styles from "./Chat.module.css";

export default function ChatHeader() {
  const global = useSelector((state) => state.global);
  const conversationsSlice = useSelector((state) => state.conversations);
  const currentConversation = global.currentConvoId
    ? conversationsSlice.conversations.find(
        (convo) => convo._id === global.currentConvoId
      )
    : null;

  return (
    <div className="ChatHeader">
      {global.receiver ? (
        <>
          <div className="Subject">
            <h1>
              {global.receiver ? global.receiver.email : `Select receiver`}
            </h1>
          </div>
        </>
      ) : currentConversation ? (
        <>
          <div className={styles.Subject}>
            <p>
              {currentConversation.participants
                .map((participant) => participant.email)
                .join(", ")}
            </p>
          </div>
        </>
      ) : (
        `Select a receiver`
      )}
    </div>
  );
}
