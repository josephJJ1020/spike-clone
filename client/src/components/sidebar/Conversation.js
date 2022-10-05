import React from "react";
import styles from "./Sidebar.module.css";

import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentConvoId,
  setReceiver,
} from "../../store/slices/globalsSlice";

export default function Conversation({ convo }) {
  const { userData } = useSelector((state) => state.userData);
  const { currentConvoId } = useSelector((state) => state.global);
  const dispatch = useDispatch();

  const participants = convo.participants.filter(
    (user) => user.email !== userData.email
  );

  const selected = currentConvoId === convo._id;

  return (
    <div
      className={styles.Conversation}
      onClick={() => {
        dispatch(setCurrentConvoId(convo._id));
        dispatch(setReceiver(null));
      }}
      style={{ backgroundColor: selected ? "#ffb739" : null }}
    >
      {convo.participants.length < 2
        ? 'You'
        : participants && participants.map((participant) => participant.email).join(", ")}
    </div>
  );
}
