import React from "react";
import { useContext } from "react";
import { AppContext } from "../../context";
import {useSelector} from 'react-redux'

export default function Mails() {
  const {global} = useSelector(state => state.global)
  const { messages} = useContext(AppContext);

  return (
    <div className="Mails">
      {messages || messages.length ? (
        messages.map((message, i) => (
          <div key={i}>
            <strong>{message.from.id}</strong>
            {`: ${message.message}`}
          </div>
        ))
      ) :global.currentConvo && global.currentConvo.messages.length ? (
        global.currentConvo.messages.map((message, index) => {
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
