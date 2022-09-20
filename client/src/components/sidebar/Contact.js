import React from "react";
import { AppContext } from "../../context";
import { useContext, useState } from "react";

import ContactAction from "./ContactAction";

import styles from "./Sidebar.module.css";
import addFriend from "../../images/add-friend.png";

export default function Contact({ contact }) {
  const { userId, sendFriendRequest, userData } = useContext(AppContext);
  const [showSent, setShowSent] = useState(false);

  const clickFriendRequest = () => {
    sendFriendRequest(userId, contact.id);
    setShowSent(true);

    setTimeout(() => {
      setShowSent(false);
    }, 3000);
  };

  return (
    <div className="Contact">
      <div className={styles.ContactDetails}>
        <div className={styles.onlineCircle}></div>
        {contact.firstName}
      </div>
      {userData.friends && !userData.friends.includes(contact.id) ? (
        <>
          <div className={styles.ContactActions}>
            <ContactAction source={addFriend} callback={clickFriendRequest} />
          </div>
        </>
      ) : null}

      {showSent ? (
        <div className={styles.FriendRequestSent}>Friend request sent!</div>
      ) : null}
    </div>
  );
}
