import React from "react";
import styles from "./Sidebar.module.css";
import { useContext } from "react";
import { AppContext } from "../../context";

export default function Conversation({ convo }) {
  const { setCurrentConvo } = useContext(AppContext);

  return (
    <div className={styles.Conversation} onClick={() => setCurrentConvo(convo)}>
        {convo.participants.join(", ")}
        </div>
  );
}
