import { Link } from "react-router-dom";
import styles from "./Auth.module.css";
import { useInput } from "../hooks/useInput";
import { AppContext } from "../../context";
import { useContext } from "react";

export default function SignUp() {
  const { signUp } = useContext(AppContext);
  const [firstName, setFirstName] = useInput("");
  const [lastName, setLastName] = useInput("");
  const [email, setEmail] = useInput("");
  const [pw, setPw] = useInput("");

  const submit = (e) => {
    e.preventDefault();
    signUp(email.value, pw.value, firstName.value, lastName.value)
    setFirstName("")
    setLastName("")
    setEmail("")
    setPw("")
  };

  return (
    <section className={styles.SignUpPage}>
      <header>
        <h1>Upgrade your email experience with <strong>Spike Clone</strong></h1>
        <p>Sign up now</p>
      </header>

      <form className={styles.SignUpForm}>
        <label htmlFor="firstname">First Name</label>
        <input
          type="text"
          name="firstname"
          id="firstname"
          className="form-control"
          {...firstName}
        />

        <label htmlFor="lastname">Last Name</label>
        <input
          type="text"
          name="lastname"
          id="lastname"
          className="form-control"
          {...lastName}
        />

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

        <input type="submit" value="Sign Up" className="btn btn-primary" onClick={submit}/>
        <p>
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </form>
    </section>
  );
}
