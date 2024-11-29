"use client"
import { useRouter } from 'next/navigation'
import react from "react";
import styles from '../Form.module.css'; // Assuming a CSS module is used for styles
import { useCookies } from 'react-cookie';

export default function Home() {
  const router = useRouter();
  const [verificationCode, setVerificationCode] = react.useState("");
  // const [cookies, setCookie] = useCookies(['userid']);

  const handleVerify = (e) => {
    e.preventDefault();
    const url = new URL('http://localhost:8080/application/validate_user');

    // Set the query parameters
    const params = {
      validationcode:verificationCode,
    };
    // Append query parameters to the URL
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    console.log("Testing fetch request: "+url);
    // Make the POST request
    fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json' // specify that we're sending JSON
      },
      credentials: 'include',
      body: JSON.stringify({}) // Empty body since the query parameters are in the URL
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse JSON response
      })
      .then(data => {
        console.log('Success:', data);
        if (data?.success) {
          router.push("/success"); // Use Next.js's routing
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
    /*if (verificationCode === "123456") { // Placeholder for actual code logic
      console.log("Verification successful!");
      router.push("/dashboard"); // Redirect to dashboard after verification
    } else {
      alert("Invalid verification code");
    }*/

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