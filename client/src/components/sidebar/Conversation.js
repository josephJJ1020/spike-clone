import React from "react";
import styles from "./Sidebar.module.css";

import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentConvoId,
  setReceiver,
} from "../../store/slices/globalsSlice";

export default function Conversation({ convo }) {
  const {userData} = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  const participants = convo.participants.filter(user => user.email !== userData.email)

  return (
    <div
      className={styles.Conversation}
      onClick={() => {
        dispatch(setCurrentConvoId(convo._id));
        dispatch(setReceiver(null));
      }}
    >
      {participants &&
        participants.map(participant => participant.email).join(', ')}
    </div>
  );
}
