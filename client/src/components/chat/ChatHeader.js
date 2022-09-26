import React from "react";
import { useSelector } from "react-redux";

import styles from "./Chat.module.css";

export default function ChatHeader({ participants }) {
  const global = useSelector((state) => state.global);
  const { userData } = useSelector((state) => state.userData);

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
      ) : participants ? (
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
