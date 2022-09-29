import React from "react";
import Badge from "react-bootstrap/esm/Badge";

import { useSelector } from "react-redux";

export default function Mails({ currentConversation }) {
  const userDataSlice = useSelector((state) => state.userData);

  return (
    <section className="Mails">
      {currentConversation && currentConversation.messages.length ? (
        currentConversation.messages.map((message, index) => {
          return (
            <div key={index}>
              <strong>
                {message.from.email === userDataSlice.userData.email
                  ? "You"
                  : message.from.email}
              </strong>
              {`: ${message.content}`}
              <section>
                {message.files &&
                  message.files.map((file, index) => {
                    return (
                      <a href={file.fileLink} target="_blank" rel="noreferrer" key={index}>
                        <Badge>{file.filename}</Badge>
                      </a>
                    );
                  })}
              </section>
            </div>
          );
        })
      ) : (
        <h1>No new messages</h1>
      )}
    </section>
  );
}
