console.log("Hello Scraping");

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
      1c. Read takes
        Options to include: 
          user
      2b. Insert Takes
      3a. Input/update grade for specific take
      9. Profile update SPROC
        Takes in everything, writes everything if not null
      11. Change password
        Similar flow to sign up
    GET
      2a. Verify the code was was correct
      - Delete verification code
      3b. Calculate average from users
        Options to include:
          user
          year
          major
          nothing for all for all
      4. Search for class
        Get all classes, filter on the front end https://www.cafebonappetit.com/
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

//#region Read
router.get('/read_courses/', async function(req, res) {

});
router.get('/get_classes/:year', async function(req, res) {
    let filepath = "data/"+req.params.year+"/"+req.params.year+"_courseinfo_courseset.json";
    let dir_exists = fs.existsSync(filepath);
    res.send(dir_exists?await fs.promises.readFile(filepath):"This year's courses have not been scraped yet");
});
router.get('/get_class_name/:year/:class', async function(req, res) {
    let filepath = "data/"+req.params.year+"/";
    let course_set = req.params.year+"_courseinfo_courseset.json";
    let courses = req.params.year+"_courseinfo.json";
    let dir_exists = fs.existsSync(filepath);
    if (dir_exists) {
        let depts = await JSON.parse(await fs.promises.readFile(filepath+course_set));
        let dept = depts[req.params.class]; // the corresponding dept
        let names = await JSON.parse(await fs.promises.readFile(filepath+courses));
        res.send(names[dept][req.params.class.substring(dept.length)]);
    } else {
        res.send("This year's courses have not been scraped yet");
    }
});
router.get('/get_sections/:year/:class', async function(req, res) {
    // let filepath = req.params.year+"/"+req.params.year+"_courseinfo_courseset.json";
    // let dir_exists = fs.existsSync(filepath);
    // res.send(dir_exists?await fs.promises.readFile(filepath):"This year's sections has not been scraped yet");
});

// Update
// Overwrite old_banner_site.html. Only call when sure we can process old_site.html
router.put('/update_archive/banner',async function(req,res) {
    let content = await ScrapingServices.bannerSiteUp(); // gets the banner site html
    fs.writeFile(archivedBannerSite,content,function(err, buf) {
        if(err) {
            res.send("error writing: ", err);
        } else {
            res.send("success writing");
        }
    });
});
// Overwrite old_public_site.html. Only call when sure we can process old_site.html
router.put('/update_archive/public',async function(req,res) {
    let content = await ScrapingServices.publicSiteUp(); // gets the public site html
    fs.writeFile(archivedPublicSite,content,function(err, buf) {
        if(err) {
            res.send("error writing: ", err);
        } else {
            res.send("success writing");
        }
    });
});
// Write all courses from public site into 20XX_courseinfo.json. Year specified is the later of xxxx-yyyy, aka the year the class of yyyy graduates
router.put('/load_courses/:year',async function(req,res) {
    let curYear = ScrapingServices.thisYear();
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    // Can't tell the future
    if (req.params.year > curYear+1) {
        res.send("Invalid year: "+req.params.year);
    }
    // Since summer registrations are over and the public site will be aimed at potential new students, it'll switch over in May to the next school year.
    // Before April it will probably not have switched and therefore the next year will not yet be valid.
    if ((req.params.year == curYear+1 && ScrapingServices.curMonth() < 3)) {
        res.send("Invalid month. Too early in the year for next years schedule: "+months[curMonth()]+"\n(Correct if I'm wrong)");
    }

    // So we assume the site will switch over in May, so anything after that "current" will be next year, and we assume "prev-year" will start existing
    let year = "";
    // We know there will be a valid url for the given year
    if (req.params.year == curYear+1 || (req.params.year == curYear && ScrapingServices.curMonth() < 4)) { // Means next year and we know it's valid, so we look at the latest ("current"), or we want this year and it hasn't switched yet
        year = "current";
    } else { // So we're either looking at this year or years previous once they've been superceded by a current
        year = (req.params.year-1)+"-"+req.params.year;
    }
    // stepping through all 39 pages, will likely involve another puppeteer function to await
    let courses = await ScrapingServices.getCourses(year);
    await ScrapingServices.writeCourses(courses,req.params.year);
    res.end();
});
// Write all sections from banner site into 20XX_sectioninfo.json (depends on corresponding courseinfo.json). // Write all courses from public site into 20XX_courseinfo.json. Year specified is the later of xxxx-yyyy, aka the year the class of yyyy graduates
router.put('/load_sections/:year/',async function(req,res) {
    let curYear = ScrapingServices.thisYear();
    // Can't tell the future
    if (req.params.year > curYear+1) {
        res.send("Invalid year: "+req.params.year);
    }
    if ((req.params.year == curYear+1 && ScrapingServices.curMonth() < 3)) {
        res.send("Invalid month. Too early in the year for next years schedule: "+months[curMonth()]+"\n(Correct if I'm wrong)");
    }
    let sections = await ScrapingServices.getSections(req.params.year);
    // Load/use the collected course info while organizing 
    await ScrapingServices.writeSections(sections,req.params.year);
    
    res.end();
});

module.exports = router;