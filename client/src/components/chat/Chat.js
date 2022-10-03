import Mails from "./Mails";
import MailForm from "./MailForm";
import ChatHeader from "./ChatHeader";

import { useSelector } from "react-redux";

import styles from "./Chat.module.css";
import cat from "../../images/cat.png";
import { useEffect } from "react";

export default function Chat() {
  const global = useSelector((state) => state.global);
  const onlineUsers = useSelector((state) => state.onlineUsers);
  const { userData } = useSelector((state) => state.userData);
  const { conversations } = useSelector((state) => state.conversations);

  const currentConversation = global.currentConvoId
    ? conversations.find((convo) => convo._id === global.currentConvoId)
    : null;

  useEffect(() => {
  }, [currentConversation])

  return (
    <section className="Chat">
      {global.receiver || global.currentConvoId ? (
        <>
          <ChatHeader
            participants={
              global.currentConvoId
                ? currentConversation.participants.filter(
                    (user) => user.email !== userData.email
                  )
                : null
            }
          />
          <Mails
            currentConversation={
              global.currentConvoId ? currentConversation : null
            }
          />
          <MailForm
            participants={
              global.currentConvoId
                ? currentConversation.participants.filter(
                    (user) => user.email !== userData.email
                  )
                : null
            }
            receiverEmail={
              global.currentConvoId
                ? currentConversation.participants.filter(
                    (user) => user.email !== userData.email
                  )[0].email
                : global.receiver.email
            }
          />
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
