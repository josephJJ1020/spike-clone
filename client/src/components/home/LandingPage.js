import styles from "./Home.module.css";

import emailLogo from "../../images/email_logo.png";
import conversationalEmail from "../../images/conversational_email.png";

export function LandingPage() {
  const redirectToSignup = () => {
    window.location = "/signup";
  };
  return (
    <section className={`${styles.LandingPage}`}>
      <section id={styles.Home} className={styles.LandingPageSection}>
        <h1>Gone are the days of old email.</h1>
        <h2>Experience the new look of modern emailing.</h2>
        <button>Learn more</button>
      </section>

      <section className={`${styles.LandingPageSection} ${styles.About}`}>
        <section className={styles.Left}>
          <h1>
            Give your emails some flavor with <strong>Spike Clone</strong>
          </h1>
          <h3>Your email chat app.</h3>
          <button onClick={redirectToSignup}>
            Create an account <strong>now</strong>
          </button>
        </section>

        <section className={styles.Right}>
          <img src={emailLogo} alt="logo" />
        </section>
      </section>

      <section
        className={`${styles.LandingPageSection} ${styles.ConversationalEmail}`}
      >
        <h1>
          Introducing <strong>Conversational Email</strong>
        </h1>
        <h3>
          View your emails as chat messages and increase your efficiency as a
          team.
        </h3>
        <img src={conversationalEmail} alt="conversational email" />
      </section>

      <section className={styles.CreateAccount}>
        <section>
          <button onClick={redirectToSignup}>Create an account</button>
        </section>
        <section>
          <h2>Interested? Join us.</h2>
        </section>
      </section>
    </section>
  );
}
