import Mails from "./Mails";
import MailForm from "./MailForm";
import ChatHeader from "./ChatHeader";
import { AppContext } from "../../context";
import { useContext } from "react";

export default function Chat() {
  const {receiver} = useContext(AppContext)
  return (
    <div className="Chat">
      <ChatHeader />
      <Mails />
      {
        receiver ? <MailForm /> : null
      }
      
    </div>
  );
}
