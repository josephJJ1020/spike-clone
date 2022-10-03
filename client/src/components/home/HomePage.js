import Contacts from "../sidebar/SideBar";
import Chat from "../chat/Chat";

export default function HomePage() {
  return (
    <section className="App-container">
      <Contacts />
      <Chat />
    </section>
  );
}
