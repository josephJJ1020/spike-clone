import { Link } from "react-router-dom";
import styles from "./Auth.module.css";
import { useInput } from "../hooks/useInput";
import { AppContext } from "../../context";
import { useContext } from "react";

import { getAuth } from "../../controllers/getAuth";
import { useSelector, useDispatch } from "react-redux";
import { setFlashMsg } from "../../store/slices/globalsSlice";

export default function SignUp() {
  const { global } = useSelector((state) => state.global);
  const dispatch = useDispatch();
  // const { signUp, setFlashMsg } = useContext(AppContext);
  const [firstName, setFirstName] = useInput("");
  const [lastName, setLastName] = useInput("");
  const [email, setEmail] = useInput("");
  const [pw, setPw] = useInput("");

  const signUp = async (email, password, firstName, lastName) => {
    const userData = await getAuth({
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
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
    var trimmedFirstName = firstName.value.replace(/\s/g, ""),
      trimmedLastName = lastName.value.replace(/\s/g, ""),
      trimmedEmail = email.value.replace(/\s/g, ""),
      trimmedPw = pw.value.replace(/\s/g, "");

    if (!trimmedFirstName.length || !trimmedLastName.length) {
      dispatch(
        setFlashMsg({ type: "error", message: "Name fields must not be empty" })
      );
      return;
    } else if (!trimmedEmail.length) {
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
          message: "Password must be more less than 8 characters ",
        })
      );
      return;
    }

    signUp(trimmedEmail, trimmedPw, trimmedFirstName, trimmedLastName);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPw("");
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
