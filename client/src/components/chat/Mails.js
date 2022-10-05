import React from "react";
import Badge from "react-bootstrap/esm/Badge";

import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";

import { useContext } from "react";
import { AppContext } from "../../context";

import styles from "./Chat.module.css";

export default function Mails({ x }) {
  const { userData } = useSelector((state) => state.userData);
  const { conversations } = useSelector((state) => state.conversations);
  const { currentConvoId } = useSelector((state) => state.global);

  const { lazyLoadConversation } = useContext(AppContext);

  const containerDiv = useRef();
  const fetchDiv = useRef(null);
  const bottomDiv = useRef();

  const currentConversation = currentConvoId
    ? conversations.find((convo) => convo._id === currentConvoId)
    : null;

  // lazy loading
  const options = {
    root: containerDiv.current,
    rootMargin: "0px",
    threshold: 1.0,
  };

  const callbackFunction = (entries) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      lazyLoadConversation(currentConvoId, currentConversation.messages.length);
    }
  };

  useEffect(() => {
    bottomDiv.current.scrollIntoView();
  },[currentConversation]);

  useEffect(() => {
    const observer = new IntersectionObserver(callbackFunction, options);
    if (fetchDiv.current) observer.observe(fetchDiv.current);

    return () => {
      if (fetchDiv.current) observer.unobserve(fetchDiv.current);
    };
  }, [fetchDiv, options]);

  return (
    <section
      className={styles.Mails}
      key={currentConversation}
      ref={containerDiv}
    >
      <div ref={fetchDiv}></div>
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
