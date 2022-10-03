import React from "react";
import Badge from "react-bootstrap/esm/Badge";

import { useSelector } from "react-redux";
import { useRef, useEffect } from "react";

export default function Mails({ currentConversation }) {
  const userDataSlice = useSelector((state) => state.userData);

  const bottomDiv = useRef();

  useEffect(() => {
    bottomDiv.current.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <section className="Mails">
      {currentConversation && currentConversation.messages.length ? (
        currentConversation.messages.map((message, index) => {
          return (
            <section
              key={index}
              className="message"
              style={{
                textAlign:
                  message.from.email !== userDataSlice.userData.email
                    ? "left"
                    : "right",
              }}
            >
              <strong>
                {message.from.email === userDataSlice.userData.email
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
