import React from "react";
import Head from "next/head";
import "./class.css"; // Adjust the path if necessary
import "../Form.module.css";

function AcademicFields({ className, number }) {
  return (
    <>
      <Head>
        {/* Required meta tags */}
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />

        {/* Bootstrap CSS */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/style/major.css" />
        <title>Academic Fields</title>
      </Head>
      <div>
      <nav>
  {/* Left Section: Home Button */}
  <div className="nav-left">
    <form action="/home" method="post">
      <input type="submit" value="Home" className="home-button" />
    </form>
  </div>

  {/* Center Section: Search Box and Search Button */}
  <div className="nav-center">
    <form action="/classsearch" method="post">
      <input
        type="text"
        name="search"
        id="search"
        placeholder="Search for a class..."
      />
      <input type="submit" value="Search" />
    </form>
  </div>
</nav>



<div className="header-section">

        <div className="main-container">
  {/* Class Name Text */}
  <div className="class-name-text">Class Name        
    <h4>
          Average {className} {number} Grade:
        </h4></div>

  {/* Form Box */}
  <div className="form-box">
    <form action="/addgrade" method="post">
      <label htmlFor="className">Class Name:</label>
      <select name="className" id="className">
        <option value="Math">Math</option>
        <option value="Science">Science</option>
      </select>

      <label htmlFor="grade">Latest Grade Received:</label>
      <select name="grade" id="grade">
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>

      <label htmlFor="classCount">Number of Times Class was Taken:</label>
      <input type="number" name="classCount" id="classCount" min="1" />

      <label htmlFor="professor">Professor with the Last Class:</label>
      <input type="text" name="professor" id="professor" />

      <input type="submit" value="Submit" />
    </form>
  </div>
</div>
</div>


        <h5>Average Professor Grade Given:</h5>
      </div>

      {/* Optional JavaScript */}
      <script
        src="https://code.jquery.com/jquery-3.2.1.slim.min.js"
        integrity="sha384-KJ3o2DKtIkvYIK3UENzmM7KCkRr/rE9/Qpg6aAZGJwFDMVNA/GpGFF93hXpG5KkN"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"
        integrity="sha384-ApNbgh9B+Y1QKtv3Rn7W3mgPxhU9K/ScQsAP7hUibX39j7fakFPskvXusvfa0b4Q"
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"
        integrity="sha384-JZR6Spejh4U02d8jOt6vLEHfe/JQGiRRSQQxSfFWpi1MquVdAyjUar5+76PVCmYl"
        crossOrigin="anonymous"
      ></script>
    </>
  );
}

export default AcademicFields;
