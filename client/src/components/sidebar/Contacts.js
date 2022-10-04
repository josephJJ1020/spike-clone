import Contact from "./Contact";

import { useSelector } from "react-redux";

import styles from "./Sidebar.module.css";

export default function Contacts() {
  const {onlineUsers} = useSelector((state) => state.onlineUsers);

  return (
    <section className={styles.ContactsContainer}>
      <section className={styles.Contacts}>
        <h2>Users</h2>
        <p>Online:</p>
        {onlineUsers && onlineUsers.length ? (
          onlineUsers.map((contact, index) => (
            <Contact key={index} contact={contact} />
          ))
        ) : (
          <p>No users online</p>
        )}
      </section>
    </section>
  );
}
