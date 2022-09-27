import styles from "./Call.module.css";

import { Video, RemoteVideo } from "./Video";

import { useSelector } from "react-redux";

import { CallButtons } from "./CallButtons";

export function CallScreen() {
  const { onCall } = useSelector((state) => state.callState);

  return (
    <>
      {onCall ? (
        <section className={styles.CallBackground}>
          <section className={styles.Call}>
            <section className={styles.Videos}>
              <Video />
              <RemoteVideo />
            </section>
            <CallButtons />
          </section>
        </section>
      ) : null}
    </>
  );
}
