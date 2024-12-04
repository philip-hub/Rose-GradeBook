"use client";

import Image from "next/image";
import { useRouter } from 'next/navigation'
import "./landing.css"

export default function Home() {
  const router = useRouter();
const redirectSignup = () => {
  router.push("/signup");
}

  return (
    <html lang="en">
      <body>
        <header>
        <nav>
            <div class="logo">RHateMyProfessor</div>
            <ul>
                <li><a href="/signup">Join</a></li>
                <li><a href="/login">Log In</a></li>
            </ul>
        </nav>
        </header>

        <div className="header-section">
    <h1>RHateMyProfessor</h1>
    <p>Explore real-time data from Rose's academic system</p>
    <button>Get Started</button>
</div>


        <div className="container">
          <div className="box-row">
            <div className="box">
              {/* Small graph 1 */}
              <p>Graph 1</p>
            </div>
            <div className="box">
              {/* Small graph 2 */}
              <p>Graph 2</p>
            </div>
            <div className="box">
              {/* Small graph 3 */}
              <p>Graph 3</p>
            </div>
          </div>
        </div>

        <p class="centered-text">Open Gradebook is a platform for Rose students to anonymously share and access grade reports, professor feedback, and course resources. 
          By contributing, you help create a transparent, peer-driven database that gives students valuable insights into courses and professors. 
          All contributions are anonymous, ensuring privacy while empowering students with data that has historically been kept behind closed doors. 
          Sign up today to take control of your academic experience!</p>


          <footer>
    <p>&copy; 2024 RHateMyProfessor. All rights reserved. <a href="/about">About Us</a> | <a href="/contact">Contact</a></p>
</footer>

      </body>
    </html>
  );
}