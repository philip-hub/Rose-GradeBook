import React, { useState } from "react";
import { useRouter } from "next/router";
import styles from '../Form.module.css'; // Assuming a CSS module is used for styles

const VerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const router = useRouter();

  const handleVerify = (e) => {
    e.preventDefault();
    // Perform verification code logic here
    if (verificationCode === "123456") { // Placeholder for actual code logic
      console.log("Verification successful!");
      router.push("/dashboard"); // Redirect to dashboard after verification
    } else {
      alert("Invalid verification code");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Verify Your Account</h2>
      <p>Please enter the verification code we sent to your email.</p>
      <form onSubmit={handleVerify} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Verification Code:</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <button type="submit" className={styles.button}>Verify</button>
      </form>
    </div>
  );
};

export default VerificationPage;
