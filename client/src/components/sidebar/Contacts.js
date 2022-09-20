import React from "react";
import Contact from "./Contact";
import { useContext } from "react";
import { AppContext } from "../../context";
import styles from './Sidebar.module.css'

export default function Contacts() {
  const { onlineUsers } = useContext(AppContext);
  
  return (
    <div className={styles.Contacts}>
      <h2>Your Contacts</h2>
      <p>Online:</p>
      {onlineUsers.length ? (
        onlineUsers.map((contact, index) => (
          <Contact key={index} contact={contact} />
        ))
      ) : (
        <p>No users online</p>
      )}
    </div>
  );
}
