import styles from "./Home.module.css";

import emailLogo from "../../images/email_logo.png";
import conversationalEmail from "../../images/conversational_email.png";

import { gsap, Bounce } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useRef, useEffect } from "react";

export function LandingPage() {
  gsap.registerPlugin(ScrollTrigger);
  const redirectToSignup = () => {
    window.location = "/signup";
  };

  const homeRef = useRef();
  const aboutRef = useRef();
  const conversationalEmailRef = useRef();

  const scrollAboutIntoView = () => {
    aboutRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // home section animation
  useEffect(() => {
    const home = homeRef.current;
    gsap.from(home.querySelector(`h1`), {
      duration: 1,
      translateY: "100%",
      opacity: 0,
    });
  }, []);

  // about section animation
  useEffect(() => {
    const about = aboutRef.current;

    gsap.from(about.querySelector("img"), {
      translateY: "100%",
      opacity: 0,
      duration: 1,
      ease: Bounce.easeOut,
      scrollTrigger: {
        trigger: about.querySelector("#animate-logo"),
        start: "top center",
        end: "bottom top",
      },
    });
  }, []);

  // conversational email section animation
  useEffect(() => {
    const conversationalEmail = conversationalEmailRef.current;

    gsap.fromTo(
      conversationalEmail.querySelector("img"),
      {
        scale: 0.1,
        opacity: 0,
        translateX: "-50%"
      },
      {
        scale: 1,
        opacity: 1,
        translateX: "-50%",
        duration: 1,
        scrollTrigger: {
          trigger: conversationalEmail.querySelector(
            "#animate-conversationalEmail"
          ),
          start: "top center",
          end: "bottom top",
        },
      }
    );
  }, []);

  return (
    <section className={`${styles.LandingPage}`}>
      <section
        id={styles.Home}
        className={styles.LandingPageSection}
        ref={homeRef}
      >
        <h1 style={{ transformOrigin: "bottom center" }}>
          Gone are the days of old email.
        </h1>
        <h2>Experience the new look of modern emailing.</h2>
        <button onClick={() => scrollAboutIntoView()}>Learn more</button>
      </section>

      <section
        className={`${styles.LandingPageSection} ${styles.About}`}
        ref={aboutRef}
      >
        <section className={styles.Left}>
          <h1>
            Give your emails some flavor with <strong>Spike Clone</strong>
          </h1>
          <h3>Your email chat app.</h3>
          <button onClick={redirectToSignup}>
            Create an account <strong>now</strong>
          </button>
        </section>

        <section className={styles.Right} id="animate-logo">
          <img src={emailLogo} alt="logo" />
        </section>
      </section>

      <section
        className={`${styles.LandingPageSection} ${styles.ConversationalEmail}`}
        ref={conversationalEmailRef}
      >
        <h1 id="animate-conversationalEmail">
          Introducing <strong>Conversational Email</strong>
        </h1>
        <h3>
          View your emails as chat messages and increase your efficiency as a
          team.
        </h3>
        <img
          src={conversationalEmail}
          alt="conversational email"
          style={{ transformOrigin: "bottom center" }}
        />
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
