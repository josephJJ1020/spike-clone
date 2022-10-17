import React from "react";
import Conversations from "./Conversations";
import AddConversationButton from "./AddConversation";

import CloseButton from "react-bootstrap/esm/CloseButton";

import callRing from "../call/telephone-ring.mp3";

import styles from "./Sidebar.module.css";

import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { setShowSidebar } from "../../store/slices/globalsSlice";

export default function SideBar() {
  const { showSidebar } = useSelector((state) => state.global);
  const dispatch = useDispatch();

  useEffect(() => {
    const displaySidebarOnResize = () => {
      if (window.matchMedia("(min-width: 615px)").matches) {
        dispatch(setShowSidebar(true));
      }
    };

    window.addEventListener("resize", displaySidebarOnResize);
  });

  return (
    <aside
      className={styles.SideBar}
      style={{ display: showSidebar ? "block" : "none" }}
    >

      <CloseButton
        className={styles.CloseButton}
        onClick={() => {
          dispatch(setShowSidebar(false));
        }}
      />
      <h2>Inbox</h2>
      <Conversations />
      <AddConversationButton />
    </aside>
  );
}
