import React from "react";
import styles from "./Sidebar.module.css";

import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentConvoId,
  setReceiver,
} from "../../store/slices/globalsSlice";

export default function Conversation({ convo }) {
  const userDataSlice = useSelector((state) => state.userData);
  const dispatch = useDispatch();

  return (
    <div
      className={styles.Conversation}
      onClick={() => {
        dispatch(setCurrentConvoId(convo._id));
        dispatch(setReceiver(null));
      }}
    >
      {convo.participants &&
        convo.participants
          .map((participant) =>
            userDataSlice.userData.firstName === participant.firstName
              ? "You"
              : participant.firstName
          )
          .join(", ")}
    </div>
  );
}
