import Contacts from "../sidebar/Contacts";
import Chat from "../chat/Chat";

export default function HomePage() {
  return (
    <div className="App-container">
      <Contacts />
      <Chat />
    </div>
  );
}
