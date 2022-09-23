import Contact from "./Contact";

import { useSelector } from "react-redux";

import styles from "./Sidebar.module.css";

export default function Contacts() {
  const onlineUsers = useSelector((state) => state.onlineUsers);

  return (
    <section className={styles.Contacts}>
      <h2>Your Contacts</h2>
      <p>Online:</p>
      {onlineUsers.onlineUsers && onlineUsers.onlineUsers.length ? (
        onlineUsers.onlineUsers.map((contact, index) => (
          <Contact key={index} contact={contact} />
        ))
      ) : (
        <p>No users online</p>
      )}
    </section>
  );
}
