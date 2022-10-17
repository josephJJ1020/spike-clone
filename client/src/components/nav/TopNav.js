import React from "react";
import { AppContext } from "../../context";
import { useContext } from "react";

import { useSelector } from "react-redux";

import styles from "./Nav.module.css";
import { Link } from "react-router-dom";

export default function TopNav() {
  const { userData, userId } = useSelector((state) => state.userData);

  const logOut = () => {
    sessionStorage.setItem("userId", null);
    sessionStorage.setItem("userDetails", null);
    window.location.reload();
  };

  return (
    <nav className={styles.TopNav}>
      <Link to="/">
        <p>Spike Clone</p>
      </Link>

      <ul>
        {userId ? (
          <>
            <li className={styles.UserEmail}>{userData.email}</li>

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
