import Image from "next/image";
import Script from "next/script";
import logo from '@/images/logo.png';

export default function Home() {
  return (
    <html lang="en">
      <body>
        <div class="container">
          <h1>Discovering Rose&apos;s real academic data</h1>
          <Image src={logo} alt="Logo"/>
          <br></br>
          <div><Link href={"/signup"}></Link></div>
        </div>
      </body>
    </html>
  );
}
