import React from "react";
import Contact from "./Contact";
import { useContext } from "react";
import { AppContext } from "../../context";

export default function Contacts() {
  const { onlineUsers } = useContext(AppContext);

  const makeContact = (n) => {
    let mylist = [];
    for (let i = 0; i < n; i++) {
      mylist.push(<Contact />);
    }
    return mylist;
  };
  return (
    <div className="Sidebar">
      <h2>Your Contacts</h2>
      <p>Online:</p>
      {
        onlineUsers.length ? onlineUsers.map((contact, index) => <Contact key={index} contact={contact}/>) : <p>No users online</p>
      }
      {/* {makeContact(5).map((contact, index) => contact)} */}
    </div>
  );
}
