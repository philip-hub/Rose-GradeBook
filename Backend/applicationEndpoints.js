console.log("Hello Scraping");

var express = require('express');
var router = express.Router();
const fs = require("fs");
const { DateTime } = require("luxon");
var ApplicationServices = require('./Services/ApplicationServices.js');

// Overview
  // This API will allow for the maintenance and use of a webscraper for Rose-Hulman's publicly available course offerings as well as specific sections for user's with credentials

// Commands: 
    // Verification (COMPLETE)
        // NOTE: Someone has to have already done 2FA before this works. I am using my credentials for this
        // Put - Overwrite old_banner_site.html. Only call when sure twe can process old_site.html
        // Get - The banner site is up/we logged in right (or at least has the html we expect)
        // Put - Overwrite old_public_site.html. Only call when sure we can process old_site.html
        // Get - The public site is up/we logged in right (or at least has the html we expect)
    // Data acquisition (COMPLETE)
        // NOTE: We can make this more flexible and parametrize by year, professor, etc. to update information in only parts of the db but waiting for mongodb first since I don't want to implement allat in json
        // NOTE: New folders for each new year represented, with each one containing the respective courses and sections jsons
        // Put - Write all courses from public site into 20XX_courseinfo.json. Year specified is the later of xxxx-yyyy, aka the year the class of yyyy graduates
            // courseinfo needs to be organized by department, then course id/name
        // Put - Write all sections from banner site into 20XX_sectioninfo.json (depends on corresponding courseinfo.json). // Write all courses from public site into 20XX_courseinfo.json. Year specified is the later of xxxx-yyyy, aka the year the class of yyyy graduates
            // sectioninfo needs to be organized by quarter, then department, then course id/name, then section/professor
        // Put - maybe later, also getting all of the descriptions could be fun
    // Data distribution - the fun stuff (IN PROGRESS)
        // A bunch of Gets, basically anything an actual DB can do, mixing and matching parameters to yoink appropriate records. Implementing this will be herculean with jsons, so just wait for and leverage mongodb or mysql when it comes around
        // Get - whether a class exists (to prevent invalid classes from being created)
        // Get - whether a section exists (to prevent invalid sections from being created) (if their section is empty so far and invisible,
        //       we'll ask if they can't find a section that anyone's been a part of; don't want to overwhelm with empty sections)
        // Get - any non-empty classes

// ISSUES: 
    // There seems to be a recurring issue relating to a failure to log in.
        // It's resolved by manually logging into banner web, navigating to the schedule while logged in, and then logging out
        // Potentially also just solved by waiting
    // 2FA is a pain in the arse
        // Potential solution: We'll have a get where we send in a username, password, and phone number
        // Then we'll have a post where we send in the 2FA code
    // Error: Requesting main frame too early!
        // Seems to happen arbitrarily, just rerun

// Read
// RUN BEFORE FUTURE SCRAPING. Checks if the banner site is up/in the same format it was designed for
router.get('/scraping_up/banner/:username/:password', async function(req, res) {
    let content = await ScrapingServices.bannerSiteUp(req.params.username,req.params.password); // gets the banner site html
    let prev = await fs.promises.readFile(archivedBannerSite);
    res.send(content==prev?"banner scraping is up":"banner scraping is down. \nUsername/password may be incorrect: \nHow to encode special characters in URLs (e.g., '/' = %2F):\n https://www.w3schools.com/tags/ref_urlencode.ASP");
});
// RUN BEFORE FUTURE SCRAPING. Checks if the public site is up/in the same format it was designed for
router.get('/scraping_up/public', async function(req, res) {
    let content = await ScrapingServices.publicSiteUp(); // gets the public site html
    let prev = await fs.promises.readFile(archivedPublicSite);
    res.send(content==prev?"public scraping is up":"public scraping is down");
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