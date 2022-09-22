import { useSelector } from "react-redux";
import Conversation from "./Conversation";
import styles from "./Sidebar.module.css";

export default function Conversations() {
  // const { conversations } = useContext(AppContext);
  const conversations = useSelector((state) => state.conversations);
  return (
    <div className={styles.Conversations}>
      <h2>Inbox</h2>
      {conversations.conversations.length ? (
        conversations.conversations.map((convo, index) => {
          return <Conversation key={index} convo={convo} />;
        })
      ) : (
        <p>No conversations</p>
      )}
    </div>
  );
}
