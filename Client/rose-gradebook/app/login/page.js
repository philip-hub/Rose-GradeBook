import React, { useState } from "react";
import styles from '../styles/Form.module.css'; // Assuming a CSS module is used for styles

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "" || password === "") {
      setErrorMessage("Please fill in both fields.");
      return;
    }
    setErrorMessage(""); // Clear error if any
    console.log("Logged in!");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Login</h2>
      <form onSubmit={handleLogin} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" className={styles.button}>Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
