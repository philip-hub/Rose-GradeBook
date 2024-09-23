"use client"
import { useRouter } from 'next/navigation'
import react from "react";
import styles from '../Form.module.css'; // Assuming a CSS module is used for styles

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = react.useState("");
  const [email, setEmail] = react.useState("");
  const [password, setPassword] = react.useState("");
  const [confirmPassword, setConfirmPassword] = react.useState("");
  const [errorMessage, setErrorMessage] = react.useState("");
  // const router = react.useRouter(); // Using Next.js router
  const [gpa, setGPA] = react.useState("");
  const [standing, setStanding] = react.useState("");
  const [major, setMajor] = react.useState("");
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