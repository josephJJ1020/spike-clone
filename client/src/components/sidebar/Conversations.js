import { useSelector } from "react-redux";
import Conversation from "./Conversation";
import styles from "./Sidebar.module.css";

export default function Conversations() {
  const { gettingConversations, conversations } = useSelector(
    (state) => state.conversations
  );
  return (
    <section className={styles.Conversations}>
      {conversations.length ? (
        [...conversations].map((convo, index) => {
          return <Conversation key={index} convo={convo} />;
        })
      ) : gettingConversations && (!conversations || !conversations.length) ? (
        <p>Fetching emails...</p>
      ) : (
        <p>No conversations</p>
      )}
    </section>
  );
}
