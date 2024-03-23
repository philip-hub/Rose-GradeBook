console.log("Hello Application");

var express = require('express');
var router = express.Router();
const fs = require("fs");
const { DateTime } = require("luxon");
var ApplicationServices = require('./Services/ApplicationServices.js');

// Overview
  // This API will allow for all of the communication necessary for the frontend of OpenGradebook

  /*
  - All requests will need a JWT in the header
  - Only at most three can be generated, any more and the latest will be deleted
    - Have the insert sproc do this automatically
  - Will use this for user id
  - Use return parameters fora llof these tgo easdily assess errors and/or get outputs; use string appending to get more (multiple is hassle, but maybe a workaeound)
    POST
      1. Add user
         a. Use a sproc to make sure the email isn't duplicated; if it is, send back a return value that indicates the user is already signed up
            - Use enum for major; json file
            - Make a majors table; have it reference users (1 to many)
            - Also username and password minimum length, email formatting should be checked with https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
              - Email blacklist json cross referenced
            - Add to the table whether or not why’re verified and salt stuff for email and password
         b. Generate code and send to email
            - Even without send to email, create a table that has users and the genereated code; deleted upon new code gen or successful verification
      1c. Read takes - Just make it a select statement
        Options to include: 
          user
      2b. Insert Takes
      3a. Update grade for specific take
      9. Profile update SPROC
        Takes in everything, writes everything if not null
      11. Change password
        Similar flow to sign up
    GET
      2a. Verify the code was was correct - sproc that return success and removes
      - Delete verification code
      - Make a signups table - use have a limit on the number of users, delete from it if it's success
      3b. Calculate average from users
        Options to include:
          user
          year
          major
          nothing for all for all
      4. Search for class
        Two choices: 
          Get all classes, filter on the front end https://www.cafebonappetit.com/
          Use a sproc and filter on the backend with an index on the name like 333 group
      5. Get grade
        Options to include: 
          class
          professor
          user
          Need JWT
      8. Get classes
        Options include: 
          department
        - Each will be sorted by number
      10. Login endpoint
        Options include: 
        - Returned is JWT for API
    DELETE
      2c. Delete takes
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