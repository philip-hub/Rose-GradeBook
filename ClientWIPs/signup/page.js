"use client";
import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from '../Form.module.css'; // Assuming a CSS module is used for styles

const SignupPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter(); // Using Next.js router
  const [gpa, setGPA] = useState("");
  const [standing, setStanding] = useState("");
  const [major, setMajor] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();
    // Validate email domain
    if (!email.endsWith("@rose-hulman.edu")) {
      setErrorMessage("Please use a valid rose-hulman.edu email.");
      return;
    }
    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    // Clear error and navigate to verification page
    setErrorMessage("");
    router.push("/verification"); // Use Next.js's routing
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Create Your Account</h2>
      <form onSubmit={handleSignup} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />
        </div>
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
        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm Password:</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>GPA:</label>
          <input
            type="text"
            value={gpa}
            onChange={(e) => setGPA(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Standing</label>
          <input
            type="text"
            value={standing}
            onChange={(e) => setStanding(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Major</label>
          <input
            type="text"
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className={styles.input}
            required
          />
        </div>

        
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" className={styles.button}>Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;
