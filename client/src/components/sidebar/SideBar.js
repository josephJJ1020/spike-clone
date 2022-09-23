import React from "react";
import Contacts from "./Contacts";
import Conversations from "./Conversations";
import AddConversationButton from "./AddConversation";

export default function SideBar() {
  return (
    <aside className="Sidebar">
      <Contacts />
      <Conversations />
      <AddConversationButton />
    </aside>
  );
}
