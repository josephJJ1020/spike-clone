import React from "react";
import { useContext } from "react";
import { AppContext } from "../../context";

export default function Mails() {
  const { messages, currentConvo } = useContext(AppContext);

  return (
    <div className="Mails">
      {messages || messages.length ? (
        messages.map((message, i) => (
          <div key={i}>
            <strong>{message.from.id}</strong>
            {`: ${message.message}`}
          </div>
        ))
      ) : currentConvo.messages.length ? (
        currentConvo.messages.map((message, index) => {
          return (
            <div key={index}>
              <strong>{message.from}</strong>
              {`: ${message.content}`}
            </div>
          );
        })
      ) : (
        <h1>No new messages</h1>
      )}
    </div>
  );
}
