import React from "react";
import Badge from "react-bootstrap/esm/Badge";

import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";

import styles from "./Chat.module.css";

export default function Mails({ x }) {
  const { userData } = useSelector((state) => state.userData);
  const { conversations } = useSelector((state) => state.conversations);
  const { currentConvoId } = useSelector((state) => state.global);

  const bottomDiv = useRef();

  const currentConversation = currentConvoId
    ? conversations.find((convo) => convo._id === currentConvoId)
    : null;
  useEffect(() => {
    bottomDiv.current.scrollIntoView();
  });

  return (
    <section className={styles.Mails} key={currentConversation}>
      {currentConversation && currentConversation.messages.length ? (
        currentConversation.messages.map((message, index) => {
          return (
            <section
              key={index}
              className={styles.message}
              style={{
                textAlign:
                  message.from.email !== userData.email ? "left" : "right",
              }}
            >
              <strong>
                {message.from.email === userData.email
                  ? "You"
                  : message.from.email}
              </strong>
              <p>{message.content}</p>

              <section>
                {message.files &&
                  message.files.map((file, index) => {
                    return (
                      <a
                        href={file.fileLink}
                        target="_blank"
                        rel="noreferrer"
                        key={index}
                      >
                        <Badge>{file.filename}</Badge>
                      </a>
                    );
                  })}
              </section>
              <p>{new Date(message.dateCreated).toISOString()}</p>
            </section>
          );
        })
      ) : (
        <h1>No new messages</h1>
      )}
      <section ref={bottomDiv}></section>
    </section>
  );
}
