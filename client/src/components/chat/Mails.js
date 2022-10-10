import React from "react";
import Badge from "react-bootstrap/esm/Badge";

import { useSelector } from "react-redux";
import { useState, useRef, useEffect } from "react";

import { useContext } from "react";
import { AppContext } from "../../context";

import usePrevious from "../hooks/usePrevious";

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

  let latestRef = useRef();

  // lazy loading
  const options = {
    root: containerDiv.current,
    rootMargin: "0px",
    threshold: 1.0,
  };

  // if current length of messages is greater than previous (unupdated) length, scroll down to avoid
  // running lazy load function continuously

  const [currlength, setCurrLength] = useState(10);
  const prevlength = usePrevious(currlength);

  const lastItem = currentConversation[currentConversation.messages.length - 1];

  const callbackFunction = (entries) => {
    const [entry] = entries;

    if (entry.isIntersecting) {
      lazyLoadConversation(currentConvoId, currentConversation.messages.length);

      if (currlength > prevlength) {
        latestRef.current.scrollIntoView();
      }
    }
  };

  useEffect(() => {
    bottomDiv.current.scrollIntoView();
  }, [lastItem]);

  useEffect(() => {
    setCurrLength(currentConversation.messages.length);
  }, [currentConversation.messages.length]);

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
              ref={
                index ===
                currentConversation.messages.length -
                  (currentConversation.messages.length - 10)
                  ? latestRef
                  : null
              }
              className={styles.message}
              style={{
                textAlign:
                  message.from && message.from.email !== userData.email
                    ? "left"
                    : "right",
              }}
            >
              <strong>
                {!message.from || message.from.email === userData.email
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
              <p className={styles.Date}>
                {new Date(message.dateCreated).toISOString()}
              </p>
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
