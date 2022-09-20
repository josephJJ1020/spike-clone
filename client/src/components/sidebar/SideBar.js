import React from "react";
import Contacts from "./Contacts";
import Conversations from "./Conversations";

export default function SideBar() {
  return (
    <div className="Sidebar">
      <Contacts/>
      <Conversations/>
    </div>
  );
}
