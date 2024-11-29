"use client"
import { useRouter } from 'next/navigation'
import react from "react";
import styles from '../Form.module.css'; // Assuming a CSS module is used for styles

export default function Home() {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Welcome!</h2>
    </div>
  );
};