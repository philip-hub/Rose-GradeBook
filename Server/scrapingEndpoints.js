console.log("Hello Scraping");

var express = require('express');
var router = express.Router();
const fs = require("fs");
const { get } = require('http');
const { DateTime } = require("luxon");
var puppeteer = require('puppeteer');
const { getDefaultAutoSelectFamilyAttemptTimeout } = require('net');
var ScrapingServices = require('./Services/ScrapingServices.js');

// Overview
  // This API will allow for the maintenance and use of a webscraper for Rose-Hulman's publicly available course offerings as well as specific sections for user's with credentials

// Create/Update
// Write all courses from public site into 20XX_courseinfo.json. Year specified is the later of xxxx-yyyy, aka the year the class of yyyy graduates
router.post('/courses/:year',async function(req,res) {
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
    if (req.params.year == curYear+1 || (req.params.year == curYear && ScrapingServices.curMonth() <= 4)) { // Means next year and we know it's valid, so we look at the latest ("current"), or we want this year and it hasn't switched yet
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
router.post('/sections/:year',async function(req,res) {
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
// Write all majors from public site into majorinfo.json
router.post('/majors',async function(req,res) {
    
    let majors = await ScrapingServices.getMajors();
    // Load/use the collected course info while organizing 
    await ScrapingServices.writeMajors(majors);    
    res.end();
});

// Rate My Professor scraping steps
// 1. Get all the links most likely to correspond to them
/** toddoy: Make a version of this that automatically goes through all dropdowns and do this before closing the browser; more efficient*/
// LINKS: https://www.ratemyprofessors.com/search/professors/820
    // https://www.google.com/search?q=google+search+with+puppeteer&oq=google+search+with+puppeteer&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRhA0gEINDI1OGowajGoAgCwAgA&sourceid=chrome&ie=UTF-8
    // https://stackoverflow.com/questions/67515088/scraping-google-search-result-links-with-puppeteer
    // https://hackernoon.com/scraping-google-search-results-with-node-js
// NOTE: This process is incredibly finicky; there are multiple servers that contain varying numbers of professors at this url that you can be pointed to; try a couple times and get the one with the highest number
        // You often have to do a click or two at the beginning I'm assuming to get around bot detection
    // Even within the same server, there can be varying numbers of results, almost always less than the claimed number of professors
    // Some of the links obtained may be from professors of other schools, so review scraping should verify that the professor still teaches at rose
    // For best results, use the departments dropdown and scrape by department, still inconsistent and weird tho
        // Scraping by the All option 285 is the record amount I was able to scrape, 200 being the lowest and 293 occurring only when I manually clicked through it
    // It's whatever
router.post('/rate_my_prof_links',async function(req,res) {
    let rateMyProfLinks = await ScrapingServices.getRateMyProfLinks();
    await ScrapingServices.write("rate_my_prof_links",rateMyProfLinks);    
    res.end();
});
// 2. Go through the links and get all the reviews in a json
/** toddoy */
// Dropwdown for courselist if that's helpful, hit loadmoreuntil it's gone, nothing really fancy else
// depnum - a department number, 1-15 (or whatever you want for new links you want to add) based on the dropdown for the departments scraped
    // Reads file "data/rate_my_prof_links_"+depnum+".json"
router.post('/rate_my_prof_reviews/:depnum',async function(req,res) {
    let depnum = req.params.depnum;
    let path = "data/rate_my_prof_links_"+depnum+".json";
    let dirs_exists = fs.existsSync(path);
    if (!dirs_exists) {
        res.send("Haven't gotten Rate My Prof links for this department yet");
    }
    let rateMyProfLinks = await fs.promises.readFile(path);
    let reviews = await ScrapingServices.getReviews(JSON.parse(rateMyProfLinks).data);
    await ScrapingServices.write("reviewinfo_"+depnum,reviews);
    res.end();
});
router.post('/rate_my_prof_reviews',async function(req,res) {
    let numDepts = 8; // TODO change if this changes in the future
    let toRet = {};
    for (let depnum = 1; depnum <= numDepts; depnum++) {
        console.log("depnum: "+depnum);
        let path = "data/rate_my_prof_links_"+depnum+".json";
        let dirs_exists = fs.existsSync(path);
        if (!dirs_exists) {
            res.send("Haven't gotten Rate My Prof links for this department yet");
        }
        let rateMyProfLinks = await fs.promises.readFile(path);
        toRet[depnum] = await ScrapingServices.getReviews(JSON.parse(rateMyProfLinks).data);
    }
    await write("all/reviewinfo_"+depnum,toRet);

    res.end();
});


module.exports = router;