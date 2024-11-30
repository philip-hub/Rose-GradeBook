"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter();
  const redirectSignup = () => {
    router.push("/signup");
  }

  return (
    <div className="container">
          <h1>Discovering Rose's real academic data</h1>
          <Image
           src={"/images/logo.png"}
           alt="Logo"
           width={400}
           height={400}/>
          <br></br>
          <button onClick={redirectSignup}>Signup</button>
        </div>
  );
}