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

function responseTemplate(errors, value) {
  // see doc on spring http message response template (this will be json payload for everything)
}

// Overview
  // This API will allow for all of the communication necessary for the frontend of OpenGradebook

  /*
    GET
      3b. Calculate average from users (from entered course data)
      - Live interactivity of this would be really sick
        - Out of scope for now; would have to do some realy fancy shit (sacing avg every hour, algebraically keeping up with a little list of diffs in num and den to get new avgs x the # of averages we want like this)
      - Remind users to share their failures and successes; refactor the messaging to emphasize the benefit to everyone
        - Something like "a community-driven, crowdsourced platform to help students make informed choice"
      - Needs to be a sproc because will need to get clean averages of each user (only the latest takes of each course by each user used in the average)
        - Summer is last, not first; link academic calendar on site front page too to advertise for future planning
        - We need a view of courses with only the coursedeptandname and the age (calculated from year and quarter; honestly could be as simple as sum of quarter as tenths digit and year kept the same [e.g. 2022.3 hey this actually kind of like reality lol, I could make the decimals all realistically for each quarter]) and courseid - these will give use the info we need for the join with takes
          - This will give us the grades of all of the latest courses, after we filter the view above to those with the highest age within each coursedeptandname

      - Strategy will be to do a similar style filter as 3c with appendings; then this table is inserted into
        - If this succeeds, then we run the sproc with output param 2.7
          Options to include (filtering the users):
            user (user-specific)
            user year (standing)
            major
            double majors (all, not specific)
            triple major (all, not specific)
            nothing for all for all
      3c. Calculate average from courses (based on all course fields; and their interserctions)
          - We can just use where statements appended to the query currently saved, run as a sqlsstatements
          IMPORTANTE - For all THE AVERAGES, HAVEV 10 be thee threshold of dhowing data (loading bar displayed of have far untiol we reach necessary data)
          coursedeptandnumber
          class year
          quarter
          professor
          nothing for all for all
      3d. Calculate averages from stated gpa
          - Maybe give the user a little message if they match (like, congrats!)
          - And like a gamified load bar on their profile of what % of their data has been entered by them
          Options to include (filtering the users): - can just be a sql query with the following stuff appended in the where
            - For appended to where conditions start with an always true (0 = 0) and then the ands appended
            user (user-specific)
            user year (standing)
            major
            double majors (all, not specific)
            triple major (all, not specific)
            nothing for all for all

   */

// POST
// TODO: WHY DOES IT FREEZE UP SOMETIMES??

// Example: http://localhost:8080/application/signup?email=gauravsg2004@gmail.com&username=p&password=p&gpa=4.0&standing=Freshman&isadmin=true&majors=Physics;Computer Science
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
    // TODO calling the email thing for the validation code
    console.log("Validation Code: "+validationcode);
    // res.redirect("/validate_user");
    let userid = message.message;
    req.session.userid = userid;
    res.send(message.success);
  } else {
    res.send(message.success);
  }
});
// Example: http://localhost:8080/application/take?courseid=6700&grade=3.2
router.post('/take', async function(req, res) {
  // userid,courseid,grade
  let userid = req.session.userid;
  let courseid = req.query.courseid;
  let grade = req.query.grade;

  let message = await ApplicationServices.createTake(userid,courseid,grade);
  if (message.success) {
    res.send(message.message);
  } else {
    res.send(message.message);
  }
});

// GET
// router.get('/userid', async function(req, res) {
//   //FOR TESTING, DELETE
//   res.send("usrid: "+req.session.userid);
// });
// Example: http://localhost:8080/application/user
router.get('/user', async function(req, res) { // use query parameters
  let userid = req.session.userid;
  let message = await ApplicationServices.readUser(userid);
  if (message.success) {
    res.send(message.message);
  } else {
    res.send(message.message);
  }
});
// Example: http://localhost:8080/application/take
// TODO Restrict this to a limited, realistic number (check on each insert that quarters and year aren't too high)
  // 7 courses at most per quarter
router.get('/take', async function(req, res) {
  let userid = req.session.userid;
  let message = await ApplicationServices.readTakes(userid);
  if (message.success) {
    res.send(message.message);
  } else {
    res.send(message.message);
  }
});

// TODO Figure out if we need to validate department as well
  // Also figure out which options are worth making available; need searches going through in a second at most
// Example: http://localhost:8080/application/courses?courseid=8000
// Example: http://localhost:8080/application/courses?department=MA
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
    res.send(message2.message);
  } else {
    res.send("Course ID invalid");
  }
});
// Example: http://localhost:8080/application/login?username=p&password=p
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
    res.send("Successfully logged in!");
  } else {
    res.send(message.message);
  }
});
// Example: http://localhost:8080/application/logout
router.get('/logout', async function(req, res) {
  req.session.userid = null;
  // res.redirect("/login");
  res.send(
    "Logged out!"
  );
});

// TODO
  // Will query based on the dropdown option from the search, provided by these
    // Show loading as the first result while the query is loading
  // Learn how to stall on frontend
    // Only one search one second after stopping inputs
  // Might have to add year and/or quarter to make thing more efficient; less huge search result set
// Example: http://localhost:8080/application/suggest_courses?searchstr=MA
router.get('/suggest_courses', async function(req, res) {
  let searchstr = req.query.searchstr;
  let toRet = []; // add matching query results and result type

  if (searchstr.length <= 2) {
    res.send(toRet);
  }

  let message2 = await ApplicationServices.readCourses(null,null,null,null,null,null,null);
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
      addIfMatchCourse(searchstr, course, "year", toRet);
      addIfMatchCourse(searchstr, course, "quarter", toRet);
      addIfMatchCourse(searchstr, course, "coursedeptandnumber", toRet);
    });
    toRet = removeDuplicates(toRet);
    res.send(toRet); // TODO Get standard message formatting from that
    // TODO I need to protect against queries of people not logged in I should add an auth middleware
    // TODO Add error handling
    // TODO Add averages
  } else {
    res.send(toRet);
  }
});

// PUT
// Example: http://localhost:8080/application/user?userid=39&password=passwerd&gpa=3.9&standing=Sophomore&majors=Computer Science&isvalidated=true&isadmin=true
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
    res.send(message.message);
  } else {
    res.send(message.message);
  }
});
// Example: http://localhost:8080/application/take?courseid=6701&grade=3.2
router.put('/take', async function(req, res) {
  // userid,courseid,grade
  let userid = req.session.userid;
  let courseid = req.query.courseid;
  let grade = req.query.grade;

  let message = await ApplicationServices.updateTake(userid,courseid,grade);
  if (message.success) {
    res.send(message.message);
  } else {
    res.send(message.message);
  }
});
// Example: http://localhost:8080/application/password?password=p&newpassword=giancarlo esposito
router.put('/password', async function(req, res) { 
  // (userid,password,newPassword)
  let userid = req.session.userid;
  let password = req.query.password;
  let newpassword = req.query.newpassword;

  let message = await ApplicationServices.updatePassword(userid,password,newpassword);
  if (message.success) {
    res.send(message.message);
  } else {
    res.send(message.message);
  }
});
// Example: http://localhost:8080/application/validate_user?validationcode=3429
router.put('/validate_user', async function(req, res) {
  let userid = req.session.userid;
  console.log("Suddenly: "+userid);
  let validationcode = req.query.validationcode;
  let message = await ApplicationServices.validateUser(userid, validationcode);
  if (message.success) {
    res.send(message.message);
  } else {
    res.send(message.message);
  }
});

// DELETE
// Example: http://localhost:8080/application/take?courseid=6700
router.delete('/take', async function(req, res) {
  // userid,courseid
  let userid = req.session.userid;
  let courseid = req.query.courseid;
  
  let message = await ApplicationServices.deleteTake(userid,courseid);
  if (message.success) {
    res.send(message.message);
  } else {
    res.send(message.message);
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