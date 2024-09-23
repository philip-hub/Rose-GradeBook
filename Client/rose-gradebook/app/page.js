import Image from "next/image";

export default function Home() {
  return (
    <html lang="en">
      <body>
        <div class="container">
          <h1>Discovering Rose's real academic data</h1>
          <Image src={"/images/logo.png"} alt="Logo"/>
          <br></br>
          <form method="post" action="/signup">
          <input type="submit" name="submit" value="Signup"/>
          </form>
        </div>
      </body>
    </html>
  );
}