import React from "react";
import { AppContext } from "../../context";
import { useContext } from "react";

export default function ChatHeader() {
  const {receiver} = useContext(AppContext)
  return (
    <div className="ChatHeader">
      {
        receiver ? <><div className="Subject">
        <h1>{receiver ? receiver.id : `Select receiver`}</h1>
        topic: topic
      </div>

      <div>
        <p>Other receivers</p>
      </div></>
      : `Select a receiver`
      }
      
    </div>
  );
}
