import Mails from "./Mails";
import MailForm from "./MailForm";
import ChatHeader from "./ChatHeader";

import { useDispatch, useSelector } from "react-redux";

import styles from "./Chat.module.css";
import cat from "../../images/cat.png";
import conversationLogo from "../../images/email_logo.png";

import { useEffect } from "react";
import { setShowSidebar } from "../../store/slices/globalsSlice";

export default function Chat() {
  const { currentConvoId, receiver } = useSelector((state) => state.global);
  const { onlineUsers } = useSelector((state) => state.onlineUsers);
  const { userData } = useSelector((state) => state.userData);
  const { conversations } = useSelector((state) => state.conversations);
  const dispatch = useDispatch();

  // change current conversation based on global state's current conversation ID
  const currentConversation = currentConvoId
    ? conversations.find((convo) => convo._id === currentConvoId)
    : null;

  useEffect(() => {}, [currentConversation]);

  return (
    <section className={styles.Chat}>
      <button
        className={styles.ShowConversations}
        onClick={() => {
          dispatch(setShowSidebar(true));
        }}
      >
        <img src={conversationLogo} alt="show conversations" />
      </button>
      {receiver || currentConvoId ? (
        <>
          <ChatHeader
            participants={
              currentConvoId
                ? currentConversation.participants
                : null
            }
          />
          <Mails
            currentConversation={currentConvoId ? currentConversation : null}
          />
          <MailForm
            participants={
              currentConvoId
                ? currentConversation.participants.filter(
                    (user) => user.email !== userData.email
                  )
                : null
            }
            receiverEmail={
              currentConvoId
                ? currentConversation.participants.length > 1
                  ? currentConversation.participants.filter(
                      (user) => user.email !== userData.email
                    )[0].email
                  : currentConversation.participants[0].email
                : receiver.email
            }
          />
        </>
      ) : (
        <section className={styles.noActiveConvo}>
          {onlineUsers && onlineUsers.length ? (
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
