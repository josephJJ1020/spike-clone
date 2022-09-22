import React from "react";
import styles from "./Sidebar.module.css";

import { useDispatch } from "react-redux";
import { setCurrentConvo } from "../../store/slices/globalsSlice";

export default function Conversation({ convo }) {
  const dispatch = useDispatch();

  return (
    <div
      className={styles.Conversation}
      onClick={() => dispatch(setCurrentConvo(convo))}
    >
      {convo.participants.join(", ")}
    </div>
  );
}
