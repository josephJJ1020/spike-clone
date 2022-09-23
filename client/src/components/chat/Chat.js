import Mails from "./Mails";
import MailForm from "./MailForm";
import ChatHeader from "./ChatHeader";

import { useSelector } from "react-redux";

import styles from "./Chat.module.css";
import cat from "../../images/cat.png";

export default function Chat() {
  const global = useSelector((state) => state.global);
  const onlineUsers = useSelector((state) => state.onlineUsers);

  return (
    <section className="Chat">
      {global.receiver || global.currentConvoId ? (
        <>
          <ChatHeader />
          <Mails />
          <MailForm />
        </>
      ) : (
        <section className={styles.noActiveConvo}>
          {onlineUsers.onlineUsers && onlineUsers.onlineUsers.length ? (
            <h1>Start chatting!</h1>
          ) : (
            <>
              <h1>Everyone's asleep it seems...</h1>
              <p>Come back later!</p>
              <img src={cat} alt="No online users" />
            </>
          )}
        </section>
      )}
    </section>
  );
}
