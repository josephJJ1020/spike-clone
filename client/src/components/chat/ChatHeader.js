import React from "react";
import { useSelector } from "react-redux";

import styles from "./Chat.module.css";

export default function ChatHeader({ participants }) {
  const { receiver, currentConvoId } = useSelector((state) => state.global);
  const { userData } = useSelector((state) => state.userData);

  return (
    <div className={styles.ChatHeader}>
      {receiver ? (
        <>
          <div className={styles.Subject}>
            <p>{receiver ? receiver.email : `Select receiver`}</p>
          </div>
        </>
      ) : currentConvoId ? (
        <>
          <div className={styles.Subject}>
            <p>
              {participants
                .map((participant) =>
                  participant.email !== userData.email
                    ? participant.email
                    : null
                )
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
