"use client"
import { useRouter } from 'next/navigation'
import react from "react";
import styles from '../Form.module.css'; // Assuming a CSS module is used for styles
import { useCookies } from 'react-cookie';

export default function Home() {
  const router = useRouter();
  const domain = process.env.NEXT_PUBLIC_DOMAIN || "https://api.rhatemyprofessors.com";

  const [username, setUsername] = react.useState("");
  const [email, setEmail] = react.useState("@rose-hulman.edu");
  const [password, setPassword] = react.useState("");
  const [confirmPassword, setConfirmPassword] = react.useState("");
  const [errorMessage, setErrorMessage] = react.useState("");
  // const router = react.useRouter(); // Using Next.js router
  const [gpa, setGPA] = react.useState("");
  const [standing, setStanding] = react.useState("");
  const [major, setMajor] = react.useState("");
  // const [cookies, setCookie] = useCookies(['userid']);

  const validateGPA = (value) => {
    const regex = /^\d+(\.\d{0,2})?$/; // Matches numbers with up to two decimal places
    const numericValue = parseFloat(value);
  
    if ((!regex.test(value) && value !== "") || numericValue > 4 || numericValue <= 0) {
      setErrorMessage("GPA must be a number between 0 and 4 with up to two decimal places.");
    } else {
      setErrorMessage(""); // Clear error if valid
    }
  
    setGPA(value);
  };
  


  const handleSignup = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
  
    // Validate email domain
    if (!trimmedEmail.toLowerCase().endsWith("@rose-hulman.edu")) {
      setErrorMessage("Please use a valid rose-hulman.edu email.");
      return;
    }
  
    // Validate password match
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
  
    // Validate GPA
    if (!/^\d+(\.\d{0,2})?$/.test(gpa) || parseFloat(gpa) > 4 || parseFloat(gpa) <= 0) {
      setErrorMessage("GPA must be a number between 0 and 4 with up to two decimal places.");
      return;
    }
  
    setErrorMessage(""); // Clear error and navigate to verification page
    const url = new URL(domain + '/application/signup');
  
    // Set the query parameters
    const params = {
      email,
      username,
      password,
      gpa,
      standing,
      isadmin: '0',
      majors: 'Computer Science'
    };
  
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({})
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data?.success) {
          router.push("/verification");
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
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
              onChange={(e) => validateGPA(e.target.value)}
              className={styles.input}
              required
            />

        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Standing:</label>
          <select
            value={standing}
            onChange={(e) => setStanding(e.target.value)}
            className={styles.input}
            required
          >
            <option value="">Select</option>
            <option value="freshman">Freshman</option>
            <option value="sophomore">Sophomore</option>
            <option value="junior">Junior</option>
            <option value="senior">Senior</option>
            <option value="grad_student">Grad Student</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Major:</label>
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className={styles.input}
            required
          >
            <option value="">Select</option>
            <option value="mechanical_engineering">Mechanical Engineering</option>
            <option value="computer_science">Computer Science</option>
            <option value="chemical_engineering">Chemical Engineering</option>
            <option value="computer_engineering">Computer Engineering</option>
            <option value="electrical_engineering">Electrical Engineering</option>
            <option value="mathematics">Mathematics</option>
            <option value="biomedical_engineering">Biomedical Engineering</option>
            <option value="civil_engineering">Civil Engineering</option>
            <option value="optical_engineering">Optical Engineering</option>
            <option value="engineering_design">Engineering Design</option>
            <option value="biochemistry">Biochemistry</option>
            <option value="molecular_biochemistry">Molecular Biochemistry</option>
            <option value="computational_science">Computational Science</option>
            <option value="chemistry">Chemistry</option>
            <option value="physics">Physics</option>
            <option value="biology">Biology</option>
            <option value="biomathematics">Biomathematics</option>
            <option value="nanoscience">Nanoscience</option>
          </select>
        </div>

        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
        <button type="submit" className={styles.button}>Sign Up</button>
      </form>
    </div>
  );
};