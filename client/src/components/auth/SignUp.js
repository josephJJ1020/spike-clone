import { Link } from "react-router-dom";
import styles from "./Auth.module.css";
import { useInput } from "../hooks/useInput";

import { getAuth } from "../../controllers/getAuth";
import { useSelector, useDispatch } from "react-redux";
import { setFlashMsg } from "../../store/slices/globalsSlice";

export default function SignUp() {
  const global = useSelector((state) => state.global);
  const dispatch = useDispatch();

  const [email, setEmail] = useInput("");
  const [pw, setPw] = useInput("");
  const [appPw, setAppPw] = useInput("");

  const [emailService, setEmailService] = useInput("HOTMAIL");

  const [inboundHost, setInboundHost] = useInput("");
  const [inboundPort, setInboundPort] = useInput("");
  const [outboundHost, setOutboundHost] = useInput("");
  const [outboundPort, setOutboundPort] = useInput("");

  const signUp = async (
    email,
    password,
    appPassword,
    emailService,
    inboundHost,
    inboundPort,
    outboundHost,
    outboundPort
  ) => {
    const userData = await getAuth({
      email: email,
      password: password,
      appPassword: appPassword,
      emailService: emailService,
      inboundHost: inboundHost,
      inboundPort: inboundPort,
      outboundHost: outboundHost,
      outboundPort: outboundPort,
      action: "SIGNUP",
    });
    if (global.flashMsg) return;
    if (userData.error) {
      setFlashMsg({ type: "error", message: userData.error.message });
      return;
    } else if (userData) {
      sessionStorage.setItem("userId", userData.userData.user._id);
      sessionStorage.setItem(
        "userDetails",
        JSON.stringify(userData.userData.user)
      );
      window.location.reload();
    }
  };

  const submit = (e) => {
    e.preventDefault();
    var trimmedEmail = email.value.replace(/\s/g, ""),
      trimmedPw = pw.value.replace(/\s/g, ""),
      trimmedAppPw = appPw.value.replace(/\s/g, ""),
      trimmedEmailService = emailService.value.replace(/\s/g, ""),
      trimmedInboundHost = inboundHost.value.replace(/\s/g, ""),
      trimmedInboundPort = inboundPort.value.replace(/\s/g, ""),
      trimmedOutboundHost = outboundHost.value.replace(/\s/g, ""),
      trimmedOutboundPort = outboundPort.value.replace(/\s/g, "");

    if (!trimmedEmail.length) {
      dispatch(
        setFlashMsg({ type: "error", message: "Email must not be empty" })
      );
      return;
    } else if (!trimmedPw || !trimmedPw.length) {
      dispatch(
        setFlashMsg({ type: "error", message: "Password must not be empty" })
      );
      return;
    } else if (trimmedPw.length < 8) {
      dispatch(
        setFlashMsg({
          type: "error",
          message: "Password must be more than 8 characters ",
        })
      );
      return;
    } else if (!trimmedInboundHost || !trimmedInboundPort) {
      dispatch(
        setFlashMsg({
          type: "error",
          message: "Please provide detailsinbound email service",
        })
      );
      return;
    } else if (
      trimmedEmailService !== "HOTMAIL" &&
      (!trimmedOutboundHost || !trimmedOutboundPort)
    ) {
      dispatch(
        setFlashMsg({
          type: "error",
          message: "Please provide detailsinbound email service",
        })
      );
      return;
    } else if (trimmedEmailService === "GMAIL" && !trimmedAppPw) {
      dispatch(
        setFlashMsg({
          type: "error",
          message: "Please provide app password",
        })
      );
      return;
    }

    signUp(
      trimmedEmail,
      trimmedPw,
      trimmedAppPw,
      trimmedEmailService,
      trimmedInboundHost,
      trimmedInboundPort,
      trimmedOutboundHost,
      trimmedOutboundPort
    );
    setEmail("");
    setPw("");
    setAppPw("");
    setEmailService("HOTMAIL");
    setInboundHost("");
    setInboundPort(null);
    setOutboundHost("");
    setOutboundPort(null);
  };

  return (
    <section className={styles.SignUpPage}>
      <header>
        <h1>
          Upgrade your email experience with <strong>Spike Clone</strong>
        </h1>
        <p>Sign up now</p>
      </header>

      <form className={styles.SignUpForm}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          name="email"
          id="email"
          className="form-control"
          {...email}
        />

        <label htmlFor="pw">Password</label>
        <input
          type="password"
          name="pw"
          id="pw"
          className="form-control"
          {...pw}
        />

        <label htmlFor="email-service">Email Service</label>
        <select
          className="form-select"
          aria-label="Email Service"
          {...emailService}
        >
          <option defaultValue value="HOTMAIL">
            Hotmail
          </option>
          <option value="OUTLOOK">Outlook</option>
          <option value="GMAIL">Gmail</option>
        </select>

        {emailService.value !== "GMAIL" ? null : (
          <>
            <input
              type="password"
              name="appPw"
              id="appPw"
              className="form-control"
              placeholder="Please input app password for emailing"
              {...appPw}
            />
          </>
        )}

        <section className={styles.HostDetails}>
          <section className={styles.InboundDetails}>
            <label htmlFor="inbound-host">Inbound host</label>
            <input
              type="text"
              name="inbound-host"
              id="inbound-host"
              className="form-control"
              {...inboundHost}
            />
            <label htmlFor="inbound-port">Inbound port</label>
            <input
              type="number"
              name="inbound-port"
              id="inbound-port"
              className="form-control"
              {...inboundPort}
            />
          </section>
          {emailService.value === "HOTMAIL" ? null : (
            <section className={styles.OutboundDetails}>
              <label htmlFor="outbound-host">Outbound host</label>
              <input
                type="text"
                name="outbound-host"
                id="outbound-host"
                className="form-control"
                {...outboundHost}
              />
              <label htmlFor="outbound-port">Outbound port</label>
              <input
                type="number"
                name="outbound-port"
                id="outbound-port"
                className="form-control"
                {...outboundPort}
              />
            </section>
          )}
        </section>

        <input
          type="submit"
          value="Sign Up"
          className="btn btn-primary"
          onClick={submit}
        />
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </section>
  );
}
