import { useInput } from "../hooks/useInput";
import { useContext, } from "react";
import { AppContext } from "../../context";

export default function MailForm() {
  const { sendMessage } = useContext(AppContext);
  const [message, setMessage] = useInput("");

  const submit = (event) => {
    event.preventDefault()
    
    if (message.value.length) {
      sendMessage(message.value); // receiver and sender will be defined in App.js; this only sends message.content
      setMessage("");
    }
  };

  return (
    <form className="MailForm">
      <div>
        <input
          type={"text"}
          className="form-control shadow-none"
          {...message}
          placeholder="Type message here"
        />
      </div>

      <button className="btn btn-primary" onClick={submit} type="submit">
        Send Mail
      </button>
    </form>
  );
}
