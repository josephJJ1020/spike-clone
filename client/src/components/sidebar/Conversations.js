import React from "react";
import { useContext } from "react";
import { AppContext } from "../../context";
import Conversation from "./Conversation";
import styles from './Sidebar.module.css'

export default function Conversations() {
  const { conversations } = useContext(AppContext);

  return (
    <div className={styles.Conversations}>
      <h2>Inbox</h2>
      {conversations.length ? (
        conversations.map((convo, index) => {
          return <Conversation key={index} convo={convo} />;
        })
      ) : (
        <p>No conversations</p>
      )}
    </div>
  );
}
