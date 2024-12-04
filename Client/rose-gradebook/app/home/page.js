"use client";
import React from "react";
import Head from "next/head";
import "./home.css"; // Adjust the path if necessary

function AcademicFields({
  rgpa,
  fgpa,
  spgpa,
  jgpa,
  sngpa,
  bcgpa,
  bcmgpa,
  bgpa,
  bmgpa,
  begpa,
  chemegpa,
  chemgpa,
  cegpa,
  cpsgpa,
  cpegpa,
  csgpa,
  dsgpa,
  eegpa,
  edgpa,
  isgpa,
  mgpa,
  megpa,
  opgpa,
  phgpa,
  segpa,
}) {
  const majors = [
    { path: "/Biochemistry", label: "Biochemistry", gpa: bcgpa },
    {
      path: "/Biochemistry-and-Molecular-Biology",
      label: "Biochemistry and Molecular Biology",
      gpa: bcmgpa,
    },
    { path: "/Biology", label: "Biology", gpa: bgpa },
    { path: "/Biomathematics", label: "Biomathematics", gpa: bmgpa },
    {
      path: "/Biomedical-Engineering",
      label: "Biomedical Engineering",
      gpa: begpa,
    },
    {
      path: "/Chemical-Engineering",
      label: "Chemical Engineering",
      gpa: chemegpa,
    },
    { path: "/Chemistry", label: "Chemistry", gpa: chemgpa },
    { path: "/Civil-Engineering", label: "Civil Engineering", gpa: cegpa },
    {
      path: "/Computational-Science",
      label: "Computational Science",
      gpa: cpsgpa,
    },
    {
      path: "/Computer-Engineering",
      label: "Computer Engineering",
      gpa: cpegpa,
    },
    { path: "/Computer-Science", label: "Computer Science", gpa: csgpa },
    { path: "/Data-Science", label: "Data Science", gpa: dsgpa },
    {
      path: "/Electrical-Engineering",
      label: "Electrical Engineering",
      gpa: eegpa,
    },
    {
      path: "/Engineering-Design",
      label: "Engineering Design",
      gpa: edgpa,
    },
    {
      path: "/International-Studies",
      label: "International Studies",
      gpa: isgpa,
    },
    { path: "/Mathematics", label: "Mathematics", gpa: mgpa },
    {
      path: "/Mechanical-Engineering",
      label: "Mechanical Engineering",
      gpa: megpa,
    },
    { path: "/Optical-Engineering", label: "Optical Engineering", gpa: opgpa },
    { path: "/Physics", label: "Physics", gpa: phgpa },
    {
      path: "/Software-Engineering",
      label: "Software Engineering",
      gpa: segpa,
    },
  ];

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/css/bootstrap.min.css"
          integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
          crossOrigin="anonymous"
        />
        <link rel="stylesheet" href="/style/major.css" />
        <title>Academic Fields</title>
      </Head>
      <body>
        <div className="search-bar-container">
          <form action="/classsearch" method="post">
            <input type="text" name="search" id="search" placeholder="Search for a class..." />
            <input type="submit" value="Search" />
          </form>
        </div>
        <center>
       
          <h4>Average Rose-Hulman Student GPA: {rgpa}</h4>
          <h5>
            Freshman GPA: {fgpa} Sophomore GPA: {spgpa} Junior GPA: {jgpa} Senior GPA: {sngpa}
          </h5>
        </center>

        <div className="ticker-container">
  <div className="ticker">
    {majors.map(({ label, gpa }, index) => (
      <span key={index} className="ticker-item">
        {label}: {gpa}
      </span>
    ))}
    {/* Duplicate items for seamless looping */}
    {majors.map(({ label, gpa }, index) => (
      <span key={`duplicate-${index}`} className="ticker-item">
        {label}: {gpa}
      </span>
    ))}
  </div>

</div>

<h1>Trending Classes</h1>

<div className="class-grid">
  {[
    {
      name: "Class 1",
      grade: "B+",
      professor: "Dr. Smith",
      description: "This is a brief description of Class 1.",
    },
    {
      name: "Class 2",
      grade: "A",
      professor: "Dr. Johnson",
      description: "This is a brief description of Class 2.",
    },
    {
      name: "Class 3",
      grade: "A-",
      professor: "Dr. Lee",
      description: "This is a brief description of Class 3.",
    },
    {
      name: "Class 4",
      grade: "B",
      professor: "Dr. Brown",
      description: "This is a brief description of Class 4.",
    },
    {
      name: "Class 5",
      grade: "A+",
      professor: "Dr. Taylor",
      description: "This is a brief description of Class 5.",
    },
    {
      name: "Class 6",
      grade: "B-",
      professor: "Dr. Wilson",
      description: "This is a brief description of Class 6.",
    },
  ].map((classInfo, index) => (
    <div key={index} className="class-card">
      <h1>{classInfo.name}</h1>
      <b>Average Grade:</b> <p>{classInfo.grade}</p>
      <b>Best Prof:</b> <p>{classInfo.professor}</p>
      <p>{classInfo.description}</p>
    </div>
  ))}
</div>

<style jsx>{`
  .ticker-container {
    width: 100%;
    overflow: hidden;
    background: #f8f9fa;
    margin-top: 20px;
  }

  .ticker {
    display: flex;
    white-space: nowrap;
    animation: ticker-scroll 40s linear infinite; /* Adjust speed here */
  }

  .ticker-item {
    display: inline-block;
    padding: 0 20px;
    font-size: 1rem;
    color: #333; /* Regular text color */
    white-space: nowrap;
  }

  @keyframes ticker-scroll {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-100%);
    }
  }
`}</style>


      </body>
    </>
  );
}

export default AcademicFields;
