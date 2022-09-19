import React from "react";
import { useContext } from "react";
import { AppContext } from "../../context";

export default function Mails() {
  const { messages } = useContext(AppContext);

  return (
    <div className="Mails">
      {messages.length ? (
        messages.map((message, i) => <div key={i}><strong>{message.from.id}</strong>{`: ${message.message}`}</div>)
      ) : (
        <h1>No new messages</h1>
      )}
    </div>
  );
}
