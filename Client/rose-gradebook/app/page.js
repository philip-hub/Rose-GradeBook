"use client";

import Image from "next/image";

export default function Home() {
  return (
    <div className="container">
          <h1>Discovering Rose's real academic data</h1>
          <Image
           src={"/images/logo.png"}
           alt="Logo"
           width={400}
           height={400}/>
          <br></br>
          <form method="post" action="/signup">
          <input type="submit" name="submit" value="Signup"/>
          </form>
        </div>
  );
}