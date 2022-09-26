import React from "react";

import { useSelector } from "react-redux";

export default function Mails({currentConversation}) {
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
            </div>
          );
        })
      ) : (
        <h1>No new messages</h1>
      )}
    </section>
  );
}
