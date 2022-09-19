import React from "react";
import { useContext, useRef } from "react";
import { AppContext } from "../../context";

export default function MailForm() {
  const { user, receiver, messages, setMessages, sendMessage } = useContext(AppContext);
  const message = useRef("");

  const submit = (event) => {
    if (message.current.value.length) {
      event.preventDefault();
      // setMessages([
      //   ...messages,
      //   { author: sender, message: message.current.value },
      // ]);
      sendMessage({from: user, to: receiver, message: message.current.value})
      message.current.value = "";
    }
  };

  return (
    <form className="MailForm">
      <div>
        <input
          type={"text"}
          className="form-control shadow-none"
          ref={message}
          placeholder="Type message here"
        />
      </div>

      <button className="btn btn-primary" onClick={submit} type="button">
        Send Mail
      </button>
    </form>
  );
}
