import React from "react";

import { useSelector } from "react-redux";

export default function Mails() {
  const userDataSlice = useSelector((state) => state.userData);
  const global = useSelector((state) => state.global);
  const conversationsSlice = useSelector((state) => state.conversations);

  const currentConversation = global.currentConvoId
    ? conversationsSlice.conversations.find(
        (convo) => convo._id === global.currentConvoId
      )
    : null;

  return (
    <section className="Mails">
      {currentConversation && currentConversation.messages.length ? (
        currentConversation.messages.map((message, index) => {
          return (
            <div key={index}>
              <strong>
                {message.from.firstName === userDataSlice.userData.firstName
                  ? "You"
                  : message.from.firstName}
              </strong>
              {`: ${message.content}`}
            </div>
          );
        })
      ) : (
        <h1>No new messages</h1>
      )}
    </section>
  );
}
