import styles from "./Sidebar.module.css";

export default function ContactAction({ source, callback }) {
  return (
    <button className={styles.ContactAction} onClick={callback}>
      <img src={source} alt="action" />
    </button>
  );
}
