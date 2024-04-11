console.log("Hello Application");

var express = require('express');
var router = express.Router();
const fs = require("fs");
const { DateTime } = require("luxon");

var bodyParser = require('body-parser');
var session = require('express-session');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true })); 
router.use(session(
  {
    secret: 'Super secret secret',
    cookie: {},
    resave: false,
    saveUninitialized: true}
));

var ApplicationServices = require('./Services/ApplicationServices.js');

// Overview
  // This API will allow for all of the communication necessary for the frontend of OpenGradebook

  /*
      12. (TODO) CRUD for comments
      13. (TODO) Get the endpoints and error stuff done this weekend; AWS and Redis stuff is the goal this week
          a. I think just message success and value; if it fails, pop up modal. Otherwise it does whatever success means
      14. (TODO) Set up database data export to files or something because tsql sometimes just creates cursed tables
          a. This way the whole thing can be reloaded in case of cursed table
          b. https://www.sqlshack.com/importexport-data-sql-server-using-sql-server-import-export-wizard/
          c. https://learn.microsoft.com/en-us/sql/integration-services/import-export-data/start-the-sql-server-import-and-export-wizard?view=sql-server-ver16
      15. Launch Plan Google Doc: https://docs.google.com/document/d/11ojcI6Sl3bWT0f2RV24tC7eC0SETISwn_inaGdcXilM/edit?usp=sharing
      16. Final Featureset
        // Scrape RateMyProfessors and enter the data into here, and then provide a course view so people can see ratings by courses
          // Advertise it as us already having done that work for you, and also that the idea is that people create threads after difficult tests etc and this allows them to help others
          // Put posters up[ with different quesions, followed by try our app today at with a qr code?
            // Questions: Answering the age old question of which major has it w\best (show overlapping n)
              // A place for students to anonymously place section-specific feedback all quarter long
                // Volunteering to provide input on things teachers can change now
              // Emphasize benefits for students: work life balance, egalitarian data source
                // Follow the chatgpt strats; launch the pilot in two weeks, and then we consider shutting down from there
                  // This way we can force users
                  // Look at all the pitfalls mentioned by gpt and avoid them, provide examples of the benefits it provides
                    // Having profs on our side won't hurt
                    // AVPOID THE PITFALLS OF RATEMYPROF, ADVERTISE THIS TO THEM; emphasize mental health
                    // End on an appeal to rose-hulman excellence
              // Planning courses next quarter? Want to find out what courses are the easiest/best for maintaining a work life balance? Look at this to see what courses have what difficulty
                // Looking for a tie breaker between HSSA courses?
              // Find anonymous (we only store an irreversible hash), verified comments and grades and leave tips for other users
                // Leave the grades your are and aren't proud of, for future generations of rose students
                // Had a bad test or quiz? Homework overwhelming?
                  // Leave a warning for others!
      <endpoint> make sure endpoints redirect once the projects are merged
      TODO Implement frontend story and then determine what endpoints still need to be entered
        // Have frontend display distributions smoothed (this gives illusion of lots of info)
          // returns the std dev and mean of data instead of averaging it for all the average ones
        // Really need the data loading bars
          // Return counts of the things that are being calculated for averages
            // Prolly just implement this and the above by literally subbing out the avg for count, the column
        // Imagining the flow: 
            // They sign up
            // After they auth, directs them to give grades on any four courses (suggest with only courses)
              // They receive a modal message thanking them and asking for their data, and to check back in regularly to see what's there
                // Modal contains four courses to input
                  // Dropdowns for quarter and year, then search for courses within their
                  // Also a dropdown for grade
              // The homepage is the same with stats invisible during this; says they have to enter four courses to see data
              // Bullet: Remind them that this is on the honor system, and could be important to help some students keep scholarships etc.
              // "Standard online forum rules: Keep it civil and respectful, especially towards profs. Make criticism constructive"
            // They see the landing page, with all the averages by department, major in a leaderboard type fashion
              // And sample sizes and distributions
              // This allows them to take what is said with a grain of salt
            // They can click into them and get the same little grade entry boxes as in the initial model; the click a button to say they took it and then enter the data to all the courses under them
              // Thank you modal after this too. Give total count of entries into takes. Have a little picture of a loadinging bar vertical to the goal.
              // I should put grain of salt warnings under everything
              // The course page has the avg, distribution, and number of data points
                // It also has a list of sections; you can mark that you have taken one and then 
            // or they can search for courses by certain thing
          // User profile page: update profile, emphasize not having to state username if you want
          // If logged out, show modal <Endpoint> (standardize error codes; logout = 1)
            // Do it lazily, only on errors that warrant specidfics; just try to reserve special number for logins for now
            // Otherwise just show error message directly from message sent
        // Endpoints that haven't been implemented marked with <ENDPOINT>
          */

// Error Codes
  // 99 - Not logged in
  // Everything else just give the message directly as it appears when the success is false
/** */
// POST
// TODO: General QA Stuff; no freezing, edge cases (thinking pagination), and slowness
// Example: http://localhost:3000/application/take?courseid=6700&grade=3.2
router.post('/take', async function(req, res) {
  // userid,courseid,grade
  let userid = req.session.userid;
  let courseid = req.query.courseid;
  let grade = req.query.grade;

  let message = await ApplicationServices.createTake(userid,courseid,grade);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});
// Example: http://localhost:3000/application/signup?email=gauravsg2004@gmail.com&username=p&password=p&gpa=2.49&standing=Freshman&isadmin=1&majors=Physics;Computer Science
router.post('/signup', async function(req, res) { // use query parameters: https://www.scaler.com/topics/expressjs-tutorial/express-query-params/
  // createUser (email,username,password,gpa,standing,isadmin,majors,validationcode)
  let email = req.query.email;
  let username = req.query.username;
  let password = req.query.password;
  let gpa = req.query.gpa;
  let standing = req.query.standing;
  let isadmin = req.query.isadmin;
  let majors = req.query.majors;
  
  let validationcode = ApplicationServices.generateTemporaryCode();
  let message = await ApplicationServices.createUser (email,username,password,gpa,standing,isadmin,majors,validationcode);
  if (message.success) {
    // https://medium.com/@dhananjay_71533/send-mail-using-nodemailer-in-node-js-3183366b1b1c
    console.log("Validation Code: "+validationcode);
    let message2 = await ApplicationServices.sendValidationEmail(email,validationcode);
    if (message2.success) {
      let userid = message.message;
      req.session.userid = userid;
      res.send(ApplicationServices.generateMessage(true,{createUser:message.message,verificationEmail:message2.message}));
    } else {
      res.send(message2);
    }
  } else {
    res.send(message);
  }
});

// GET
// router.get('/userid', async function(req, res) {
//   //FOR TESTING, DELETE
//   res.send("usrid: "+req.session.userid);
// });
// Example: http://localhost:3000/application/user
router.get('/user', async function(req, res) { // use query parameters
  let userid = req.session.userid;
  let message = await ApplicationServices.readUser(userid);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});
// Example: http://localhost:3000/application/take
// Don't bother restricting this to a limited, realistic number (checking on each insert that quarters and year aren't too high)
  // guilt is strat
  // 7 courses at most per quarter
router.get('/take', async function(req, res) {
  let userid = req.session.userid;
  let message = await ApplicationServices.readTakes(userid);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});
// TODO Figure out if we need to validate department as well
  // Also figure out which options are worth making available; need searches going through in a second at most
    // If performance becomes a concern, also separate out the pagination request
  // Of course remember the option to add indices
// Example: http://localhost:3000/application/courses?courseid=8000
// Example: http://localhost:3000/application/courses?department=MA
router.get('/courses', async function(req, res) {
  let page = req.query.page;

  if (!page) {
    page = 1;
  }

  let courseid = req.query.courseid;
  let name = req.query.name;
  let department = req.query.department;
  let credits = req.query.credits;
  let professor = req.query.professor;
  let year = req.query.year;
  let quarter = req.query.quarter;
  let coursedeptandnumber = req.query.coursedeptandnumber;

  let message2 = await ApplicationServices.readCoursesPagination(page, courseid, name, department, credits, professor, year, quarter, coursedeptandnumber);
  if (message2.success) {
    res.send(message2);
  } else {
    res.send(ApplicationServices.generateMessage(false,"Course ID invalid"));
  }
});
// Example: http://localhost:3000/application/login?username=p&password=p
// TODO
  // Need to call is_validated afterwards; depending on the result, redirect appropriately
router.get('/login', async function(req, res) { // should have a specific return for redirectinh to validstion or to the dashboard/any other page
  let email = req.query.email;
  let username = req.query.username;
  let password = req.query.password;

  let message = await ApplicationServices.login (username,email,password);
  if (message.success) {
    let userid = message.message;
    req.session.userid = userid;
    console.log("User: "+req.session.userid);
    res.send(ApplicationServices.generateMessage(true,"Successfully logged in!"));
  } else {
    res.send(message);
  }
});
// Example: http://localhost:3000/application/logout
router.get('/logout', async function(req, res) {
  req.session.userid = null;
  // res.redirect("/login");
  res.send(
    ApplicationServices.generateMessage(true,"Logged out!")
  );
});
// Example: http://localhost:3000/application/numTakes
// Need to call is_validated afterwards; depending on the result, redirect appropriately
router.get('/num_takes', async function(req, res) { // should have a specific return for redirectinh to validstion or to the dashboard/any other page
  let message = await ApplicationServices.numTakes();
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});
// TODO
  // Use the result of this on the dropdown along with dropdowns after with the other data
    // The other data dropdowns will be populated by the selecteds of the returned from the dropdowns accumulated options
// TODO <endpoint> the options for course entry shuld only show up (invisible) after year and quarter dropdowns populated
// Example: http://localhost:3000/application/suggest_courses?year=2021&quarter=Fall&searchstr=csse
router.get('/suggest_courses', async function(req, res) {
  let searchstr = req.query.searchstr;
  let year = req.query.year;
  let quarter = req.query.quarter;
  let toRet = []; // add matching query results and result type
  
  if (searchstr.length <= 2) {
    res.send(ApplicationServices.generateMessage(true,[])); // don't want to throw err message
    return;
  }

  if (!year) {
    res.send(ApplicationServices.generateMessage(false, "Year not entered!"));
    return;
  }

  if (!quarter) {
    res.send(ApplicationServices.generateMessage(false, "Quarter not entered!"));
    return;
  }

  let message2 = await ApplicationServices.readCourses(null,null,null,null,null, year,quarter,null);
  if (message2.success) {
    let courses = message2.message;
    let curDex = 0;
    for (let idx = 0; idx < courses.length; idx++) { // only works because sorted by coursedeptandnumber
      let prevDex = curDex-1;
      let curCourse = courses[idx];
      let cid = curCourse.courseid;
      let toAdd = (curCourse.coursedeptandnumber.toString().toLowerCase()).indexOf(searchstr.toString().toLowerCase()) != -1;
      if (toAdd) {
        if (curDex == 0) {
          let obj = {};
          obj[cid] = curCourse;
          toRet.push(obj);
        } else {
          let firstKey = Object.keys(toRet[prevDex])[0];
          if (!firstKey) { // new course
            let obj = {};
            obj[cid] = curCourse;
            toRet.push(obj);
            curDex++;
          } else { // part of existing course
            toRet[prevDex][cid] = curCourse;
          }
        }
      }
    }
    res.send(ApplicationServices.generateMessage(true,toRet));
  } else {
    res.send(message2);
  }
});
// Example: http://localhost:3000/application/suggest_course_searches?searchstr=holl
router.get('/suggest_course_searches', async function(req, res) {
  let searchstr = req.query.searchstr;
  let year = req.query.year;
  let toRet = []; // add matching query results and result type

  if (searchstr.length <= 2) {
    res.send(ApplicationServices.generateMessage(true,[]));
    return;
  }
  if (!year) {
    res.send(ApplicationServices.generateMessage(false,"Year not entered!"));
    return;
  }
  let message2 = await ApplicationServices.readCourses(null,null,null,null,null,year,null,null);
  if (message2.success) {
    let courses = message2.message;
    courses.forEach((course) => {
      // let columnNames = Object.keys(course);
      // columnNames.forEach((colname) => {
      //   console.log(colname);
      //   addIfMatchCourse(searchstr, course, colname, toRet);
      // });
      addIfMatchCourse(searchstr, course, "name", toRet);
      addIfMatchCourse(searchstr, course, "dept", toRet);
      // addIfMatchCourse(searchstr, course, "credits", toRet);
      addIfMatchCourse(searchstr, course, "professor", toRet);
      // addIfMatchCourse(searchstr, course, "year", toRet);
      // addIfMatchCourse(searchstr, course, "quarter", toRet);
      addIfMatchCourse(searchstr, course, "coursedeptandnumber", toRet);
    });
    toRet = removeDuplicates(toRet);
    
    toRet.sort((a,b) => {
        // Use toUpperCase() to ignore character casing
        let comparison = 0;
        if (a.value > b.value) {
          comparison = 1;
        } else if (a.value < b.value) {
          comparison = -1;
        } else {
          if (a.type > b.type) {
            comparison = 1;
          } else if (a.type < b.type) {
            comparison = -1;
          }
        }
        return comparison;
    });

    res.send(ApplicationServices.generateMessage(true,toRet));
  } else {
    res.send(message2);
  }
});
// Example: http://localhost:3000/application/users_calculated_average?forThisUser=true
// Example: http://localhost:3000/application/users_calculated_average?major=Computer Science
// Example: http://localhost:3000/application/users_calculated_average?isDoubleMajor=true
// Example: http://localhost:3000/application/users_calculated_average?isTripleMajor=true
router.get('/users_calculated_average', async function(req, res) {

  let userid = req.session.userid;
  let forThisUser = req.query.forThisUser;
  let standing = req.query.standing;
  let major = req.query.major;
  let isDoubleMajor = req.query.isDoubleMajor; // TODO test double and triple major functionality still
  let isTripleMajor = req.query.isTripleMajor;

  let message2 =  await ApplicationServices.userCalculatedAverage(userid, forThisUser, standing, major, isDoubleMajor, isTripleMajor);
  let message3 =  await ApplicationServices.userCalculatedAverageCount(userid, forThisUser, standing, major, isDoubleMajor, isTripleMajor);
  let message4 =  await ApplicationServices.userCalculatedAverageStdDev(userid, forThisUser, standing, major, isDoubleMajor, isTripleMajor);
  if (message2.success && message3.success && message4.success) {
    res.send(ApplicationServices.generateMessage(true,{average:message2.message,count:message3.message,stddev:message4.message}));
  } else {
    res.send(ApplicationServices.generateMessage(false,{average:message2.message,count:message3.message,stddev:message4.message}));
  }
});
// Example: http://localhost:3000/application/courses_calculated_average?department=CSSE
router.get('/courses_calculated_average', async function(req, res) {
  let courseid = req.query.courseid;
  let department = req.query.department;
  let credits = req.query.credits;
  let professor = req.query.professor;
  let year = req.query.year;
  let quarter = req.query.quarter;
  let coursedeptandnumber = req.query.coursedeptandnumber;

  let message2 = await ApplicationServices.courseCalculatedAverage(courseid, department, credits, professor, year, quarter, coursedeptandnumber);
  let message3 = await ApplicationServices.courseCalculatedAverageCount(courseid, department, credits, professor, year, quarter, coursedeptandnumber);
  let message4 = await ApplicationServices.courseCalculatedAverageStdDev(courseid, department, credits, professor, year, quarter, coursedeptandnumber);
  if (message2.success && message3.success && message4.success) {
    res.send(ApplicationServices.generateMessage(true,{average:message2.message,count:message3.message,stddev:message4.message}));
  } else {
    res.send(ApplicationServices.generateMessage(false,{average:message2.message,count:message3.message,stddev:message4.message}));
  }
});
// Example: http://localhost:3000/application/users_stated_gpa_average/?forThisUser=true
// Example: http://localhost:3000/application/users_stated_gpa_average?major=Computer Science
// Example: http://localhost:3000/application/users_stated_gpa_average?isDoubleMajor=true
// Example: http://localhost:3000/application/users_stated_gpa_average?isTripleMajor=true
router.get('/users_stated_gpa_average', async function(req, res) {
  let userid = req.session.userid;
  let forThisUser = req.query.forThisUser;
  let standing = req.query.standing;
  let major = req.query.major;
  let isDoubleMajor = req.query.isDoubleMajor;
  let isTripleMajor = req.query.isTripleMajor;

  let message2 =  await ApplicationServices.userStatedGPAAverage(userid, forThisUser, standing, major, isDoubleMajor, isTripleMajor);
  let message3 =  await ApplicationServices.userStatedGPAAverageCount(userid, forThisUser, standing, major, isDoubleMajor, isTripleMajor);
  let message4 =  await ApplicationServices.userStatedGPAAverageStdDev(userid, forThisUser, standing, major, isDoubleMajor, isTripleMajor);
  if (message2.success && message3.success && message4.success) {
    res.send(ApplicationServices.generateMessage(true,{average:message2.message,count:message3.message,stddev:message4.message}));
  } else {
    res.send(ApplicationServices.generateMessage(false,{average:message2.message,count:message3.message,stddev:message4.message}));
  }
});

// PUT
// Example: http://localhost:3000/application/user?userid=39&password=passwerd&gpa=3.9&standing=Sophomore&majors=Computer Science&isvalidated=true&isadmin=true
router.put('/user', async function(req, res) { // use query parameters
  let userid = req.session.userid;
  let password = req.query.password;
  let gpa = req.query.gpa;
  let standing = req.query.standing;
  let isadmin = req.query.isadmin;
  let isvalidated = req.query.isvalidated;
  let majors = req.query.majors;

  let message = await ApplicationServices.updateUser (userid,password,gpa,standing,isadmin,isvalidated,majors);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});
// Example: http://localhost:3000/application/take?courseid=6701&grade=3.2
router.put('/take', async function(req, res) {
  // userid,courseid,grade
  let userid = req.session.userid;
  let courseid = req.query.courseid;
  let grade = req.query.grade;

  let message = await ApplicationServices.updateTake(userid,courseid,grade);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});
// Example: http://localhost:3000/application/password?password=p&newpassword=giancarlo esposito
router.put('/password', async function(req, res) { 
  // (userid,password,newPassword)
  let userid = req.session.userid;
  let password = req.query.password;
  let newpassword = req.query.newpassword;

  let message = await ApplicationServices.updatePassword(userid,password,newpassword);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});
// Example: http://localhost:3000/application/validate_user?validationcode=3429
router.put('/validate_user', async function(req, res) {
  let userid = req.session.userid;
  console.log("Suddenly: "+userid);
  let validationcode = req.query.validationcode;
  let message = await ApplicationServices.validateUser(userid, validationcode);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});

// DELETE
// Example: http://localhost:3000/application/take?courseid=6700
router.delete('/take', async function(req, res) {
  // userid,courseid
  let userid = req.session.userid;
  let courseid = req.query.courseid;
  
  let message = await ApplicationServices.deleteTake(userid,courseid);
  if (message.success) {
    res.send(message);
  } else {
    res.send(message);
  }
});

// TODO Optimize by having queries using name be more efficient by still searching by coursedeptandnumber
function addIfMatchCourse(searchstr, course, property, toRet) {
    if ((course[property].toString().toLowerCase()).indexOf(searchstr.toString().toLowerCase()) != -1) { // Checks within, not case sensitive
      toRet.push({
        value:course[property]
        ,type:property
      });
    }
}

// Only works because of the nonexistent overlap between types and values
function removeDuplicates(objarr) {
  // Declare a new array
  let newArray = [];

  // Declare an empty object
  let uniqueObject = {};

  // Loop for the array elements
  for (let i in objarr) {

      // Extract the title
      objValue = objarr[i]['value'];
      objType = objarr[i]['type'];

      // Use the title as the index
      uniqueObject[objValue+objType] = objarr[i];
  }

  // Loop to push unique object into array
  for (i in uniqueObject) {
      newArray.push(uniqueObject[i]);
  }

  // Return the unique objects
  return newArray;
}

module.exports = router;