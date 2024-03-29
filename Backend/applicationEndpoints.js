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
      4. Search for class (https://www.algolia.com/blog/engineering/how-to-implement-autocomplete-with-javascript-on-your-website/)
          Options - use sql for all of these, no need for anything else
            By description/nsame - Autocomplete names/substring search
            By course name and dept (e.g., CSSE220) - Autocomplete names/substring search
            By professor - Autocomplete names/substring search
          Two choices: 
            Use a sproc and filter on the backend with an index on the name like 333 group (a /suggest endpoint)
            - I think this is the way to go; the algolia implementation was very simple. I just need to preload the three arays above all the endpoints and just call on them for filtering
            Use pagination for search results
        Add endpoints for getting all of these as an arrays
        - Ooh one of the could return all the professors names but with first name first, other with last name first
        - Then the autocomplete results are given
   */

// POST
// TODO: WHY DOES IT FREEZE UP SOMETIMES??

// Example: http://localhost:8080/application/signup?email=gauravsg2004@gmail.com&username=p&password=p&gpa=4.0&standing=Freshman&isadmin=true&majors=Physics;Computer Science
  // TODO I think isadmin is broken
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
    // TODO session stuff; a user was successfully created after all
    // Also calling the email thing for the validation code
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
// Example: http://localhost:8080/application/courses
// Example: http://localhost:8080/application/courses?department=MA
router.get('/courses', async function(req, res) {
  // department,courseid
  let department = req.query.department;
  let courseid = req.query.courseid;

    let message2 = await ApplicationServices.readCourses(department,courseid);
    if (message2.success) {
      res.send(message2.message);
    } else {
      res.send("Course ID invalid");
    }
});
// Example: http://localhost:8080/application/login?username=p&password=p
// TODO
  // Need to call isValidated afterwards; depending on the result, redirect appropriately
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

module.exports = router;