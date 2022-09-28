import React from "react";
import { AppContext } from "../../context";
import { useContext } from "react";

import { useSelector } from "react-redux";

import styles from "./Nav.module.css";
import { Link } from "react-router-dom";

import notifIcon from "../../images/notification.png";
import Dropdown from "react-bootstrap/Dropdown";

export default function TopNav() {
  const userData = useSelector((state) => state.userData);

  const { friendRequestAction } = useContext(AppContext);
  const logOut = () => {
    sessionStorage.setItem("userId", null);
    sessionStorage.setItem("userDetails", null);
    window.location.reload();
  };

  return (
    <nav className={styles.TopNav}>
      <div>
        <Link to="/">
          <p>Spike Clone</p>
        </Link>
      </div>
      <ul>
        {userData.userId ? (
          <>
            <li>{userData.userData.email}</li>
            <li>
              <Dropdown className="shadow-none" align="end">
                <Dropdown.Toggle
                  className={`${styles.transparent} shadow-none`}
                >
                  <img
                    src={notifIcon}
                    alt="notificaiton-icon"
                    className={`${styles.notifIcon}`}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {userData.userData.notifications &&
                  userData.userData.notifications.length ? (
                    userData.userData.notifications.map((notif, index) => {
                      if (notif && notif.type === "friend-request") {
                        return (
                          <Dropdown.Item key={index}>
                            {notif.status === "PENDING" ? (
                              <>
                                {notif.from} wants to be friends with you!
                                <div>
                                  <button
                                    className="btn btn-success"
                                    onClick={() =>
                                      friendRequestAction({
                                        id: notif.id,
                                        type: "ACCEPT",
                                        sender: userData.userId,
                                        receiver: notif.from,
                                      })
                                    }
                                  >
                                    Accept
                                  </button>
                                  <button
                                    className="btn btn-danger"
                                    onClick={() =>
                                      friendRequestAction({
                                        id: notif.id,
                                        type: "REJECT",
                                        sender: userData.userId,
                                        receiver: notif.from,
                                      })
                                    }
                                  >
                                    Decline
                                  </button>
                                </div>
                              </>
                            ) : (
                              <>You accepted {notif.from}'s friend request</>
                            )}
                          </Dropdown.Item>
                        );
                      } else if (
                        notif &&
                        notif.type === "friend-request-accepted"
                      ) {
                        return (
                          <Dropdown.Item key={index}>
                            {notif.from} accepted your friend request
                            <div></div>
                          </Dropdown.Item>
                        );
                      }

                      return null;
                    })
                  ) : (
                    <p>No new notifications!</p>
                  )}
                </Dropdown.Menu>
              </Dropdown>
            </li>
            <li>
              <Link onClick={logOut}>Log Out</Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Sign In</Link>
            </li>
            <li>
              <Link to="/signup">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
