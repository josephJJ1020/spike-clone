import React from "react";
import { AppContext } from "../../context";
import { useContext, useState } from "react";

import ContactAction from "./ContactAction";

import styles from "./Sidebar.module.css";
import addFriend from "../../images/add-friend.png";

import { useSelector, useDispatch } from "react-redux";
import {
  setCurrentConvoId,
  setReceiver,
} from "../../store/slices/globalsSlice";

export default function Contact({ contact }) {
  const { sendFriendRequest } = useContext(AppContext);
  const userData = useSelector((state) => state.userData);
  const conversationsSlice = useSelector((state) => state.conversations);
  const dispatch = useDispatch();

  const [showSent, setShowSent] = useState(false);

  const isFriend = (id) => {
    return userData.userData.friends && userData.userData.friends.includes(id);
  };

  const clickFriendRequest = () => {
    sendFriendRequest(userData.userId, contact.id);
    setShowSent(true);

    setTimeout(() => {
      setShowSent(false);
    }, 3000);
  };

  return (
    <div
      className="Contact"
      onClick={
        isFriend(contact.id)
          ? () => {
              let found = false;

              conversationsSlice.conversations.forEach((conversation) => {
                // look for conversation with less than two participants (which means its only the receiver and the current user)
                // and then check if any of the participants has the same id as the contact prop
                // if true, set current conversation
                if (
                  conversation.participants.some(
                    (user) => user.email === contact.email
                  ) &&
                  conversation.participants.length < 3
                ) {
                  found = true;
                  console.log("found");
                  dispatch(setCurrentConvoId(conversation._id));
                  dispatch(setReceiver(null));
                }
              });

              if (!found) {
                console.log("no convo found");
                dispatch(setCurrentConvoId(null));
                dispatch(
                  setReceiver({
                    id: contact.id,
                    email: contact.email,
                  })
                );
              }
            }
          : () => console.log("clicked! not friend")
      }
    >
      <div className={styles.ContactDetails}>
        <div className={styles.onlineCircle}></div>
        <div className={styles.ContactEmail}>{contact.email}</div>
      </div>
      {!isFriend(contact.id) ? (
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
