import Mails from "./Mails";
import MailForm from "./MailForm";
import ChatHeader from "./ChatHeader";
import { AppContext } from "../../context";
import { useContext } from "react";

import styles from "./Chat.module.css";
import cat from '../../images/cat.png'

export default function Chat() {
  const { receiver, currentConvo, onlineUsers } = useContext(AppContext);
  return (
    <div className="Chat">
      {receiver || currentConvo ? (
        <>
          <ChatHeader />
          <Mails />
          <MailForm />
        </>
      ) : (
        <section className={styles.noActiveConvo}>
          {onlineUsers.length ? (
            <h1>Start chatting!</h1>
          ) : (
            <>
              <h1>Everyone's asleep it seems...</h1>
              <p>Come back later!</p>
              <img src={cat} alt="No online users"/>
            </>
          )}
        </section>
      )}
    </div>
  );
}
