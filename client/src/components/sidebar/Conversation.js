import React from "react";
import styles from "./Sidebar.module.css";

import { useSelector, useDispatch } from "react-redux";
import { useContext } from "react";

import { AppContext } from "../../context";

import {
  setCurrentConvoId,
  setReceiver,
} from "../../store/slices/globalsSlice";
import { replaceConvo } from "../../store/slices/conversationsSlice";

export default function Conversation({ convo }) {
  const { userData } = useSelector((state) => state.userData);
  const { currentConvoId } = useSelector((state) => state.global);
  const dispatch = useDispatch();

  const { markConvoMessagesAsRead } = useContext(AppContext);

  const participants = convo.participants.filter(
    (user) => user.email !== userData.email
  );

  const selected = currentConvoId === convo._id;

  const unreadCount = () => {
    let count = 0;

    convo.messages.forEach((message) => {
      if (message.read && !message.read.includes(userData.email)) {
        count += 1;
      }
    });

    return count;
  };

  const markAllMessagesAsRead = () => {
    let newConvo = {
      ...convo,
      messages: convo.messages.map((message) => {
        if ("read" in message && !message.read.includes(userData.email)) {
          return { ...message, read: [...message.read, userData.email] };
        }

        return message;
      }),
    };
    dispatch(replaceConvo(newConvo));
    // emit event to mark all messages of convo as read
    markConvoMessagesAsRead(userData.email, convo._id);

    return true;
  };

  const count = unreadCount();

  return (
    <section
      className={styles.Conversation}
      onClick={() => {
        dispatch(setCurrentConvoId(convo._id));
        dispatch(setReceiver(null));
        markAllMessagesAsRead();
      }}
      style={{ backgroundColor: selected ? "#ffb739" : null }}
    >
      <section className={styles.Participants}>
        {convo.participants.length < 2
          ? "You"
          : participants &&
            participants.map((participant) => participant.email).join(", ")}
      </section>
      {count > 0 && <section className={styles.UnreadCount}>{count}</section>}
    </section>
  );
}
