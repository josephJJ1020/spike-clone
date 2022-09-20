import React from "react";
import { AppContext } from "../../context";
import { useContext } from "react";
import styles from "./Nav.module.css";
import { Link } from "react-router-dom";

export default function TopNav() {
  const { userData, userId, logOut } = useContext(AppContext);
  return (
    <nav className={styles.TopNav}>
      <div><Link to='/'>Spike Clone</Link></div>
      <ul>
        {userId ? (
          <>
            <li>{userId}</li>
            <li>{userData.lastName}</li>
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
