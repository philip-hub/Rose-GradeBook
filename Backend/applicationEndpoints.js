console.log("Hello Application");

var express = require('express');
var router = express.Router();
const fs = require("fs");
const { DateTime } = require("luxon");
var ApplicationServices = require('./Services/ApplicationServices.js');

function responseTemplate(errors, value) {
  // see doc on spring http message response template (this will be json payload for everything)
}

// Overview
  // This API will allow for all of the communication necessary for the frontend of OpenGradebook

  /*
  - ALL requests will need a JWT in the header (limit 10 per user; also age restrict to 1 day)
    - This will validate the session and also serve to authorize it to the user's authorization
    - Use returned values for any user-specific actions (indicated below as "(user-specific)")
      - Will use this for user id
      - However, frontend should be given and ask with course ids if needed for any methods (ie altering Takes)
        - However, this means wherever course ids are used, they must be validated
  - Use return parameters fora llof these tgo easdily assess errors and/or get outputs; use string appending to get more (multiple is hassle, but maybe a workaeound)
    POST
      1. Add user
         a. Use a sproc to make sure the email isn't duplicated; if it is, send back a return value that indicates the user is already signed up if validated, if not replace old one
            - Use enum for major; json file
            - Make a majors table; have it reference users (1 to many)
            - Also username and password minimum length, email formatting should be checked with https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
              - Email blacklist json cross referenced
            - Add to the table whether or not why’re verified and salt stuff for email and password
         b. Generate code and send to email
            - Even without send to email, create a table that has users and the genereated code; deleted upon new code gen or successful verification
      1c. Read takes - Just make it a select statement (user-specific)
        Options to include: 
          user
      2b. Insert Takes (user-specific)/
      3a. Update grade for specific take (user-specific)
        Why can't it they just be a SQL insert? Gotta be smart enough to just do nothing if already in or if the user has already taken this course; what if retake? this isn't used in gpa calc, but in the course calc
      9. Profile update SPROC (user-specific)
        Takes in everything, writes everything if not null
        - Will use a sproc and separate updates for each thing if not null
      11. Change password (user-specific)
        Similar to profile update... actually just make it the same
    GET
      2a. Verify the code was was correct - sproc that return success and removes
      - Delete verification code
      - Make a signups table - use have a limit on the number of users, delete from it if it's success
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
      8. Get classes - this can be done with row sql and add a where with dept specification
        Get department will be necessary too - also with sql
        Options include: 
          department
          none
        - Each will be sorted by coursedeptandnumber
      10a. Login endpoint
        - Called automatically upon signup
          - https://dvmhn07.medium.com/jwt-authentication-in-node-js-a-practical-guide-c8ab1b432a49
          - Oooh the system I'm designing uses session-based storage: https://medium.com/@anandam00/understanding-session-based-authentication-in-nodejs-bc2a7b9e5a0b
            - https://www.geeksforgeeks.org/session-cookies-in-node-js/
              - THIS is how I should implement it, using this middleware for everything that needs auth
                - https://www.tutorialspoint.com/expressjs/expressjs_authentication.htm
                - we'll redirect to login and have that redirect to page after signup
                - This method will give the email, userid desired because we'll recover it from the insert and login as output params
      10b. Log out
        - Sets user id session to null
      10c. Validate courseid - this can just be a function wrapping plain sql (select count(*) from Courses where courseid=@courseid)
        - Makes sure given courseid is valid (called before anything that needs course id)
    DELETE
      2c. Delete takes (user-specific) - plain sql
        No need to validate, I think; delete won't violate foreign key by not doing anything
   */

// GET
router.get('/courses', async function(req, res) {

});
// TODO have it insert into special table
router.get('/generate_code', async function(req, res) {
    res.send(ApplicationServices.generateTemporaryCode());
});

// POST

// DELETE

module.exports = router;