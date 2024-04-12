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
// 1. Get professors
/** toddoy */
// LINKS: https://www.rose-hulman.edu/academics/faculty/index.html
    // Looks doable, but a mapping will ne
router.post('/all_rose_profs',async function(req,res) {
    let department = req.params.department;
    let profs = await ScrapingServices.getProfessors(department);
    await ScrapingServices.write("profs",profs);    
    res.end();
});
// 2. Get all the links most likely to correspond to them
/** toddoy */
// LINKS: https://www.google.com/search?q=google+search+with+puppeteer&oq=google+search+with+puppeteer&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRhA0gEINDI1OGowajGoAgCwAgA&sourceid=chrome&ie=UTF-8
    // https://stackoverflow.com/questions/67515088/scraping-google-search-result-links-with-puppeteer
    // https://hackernoon.com/scraping-google-search-results-with-node-js
router.post('/rate_my_prof_links/:department',async function(req,res) {
    let department = req.params.department;
    let path = "data/"+department+"_profs.json";
    let dirs_exists = fs.existsSync(path);
    if (!dirs_exists) {
        res.send("Haven't gotten professors for this department yet");
    }
    let profs = await fs.promises.readFile(path);

    let rateMyProfLinks = await ScrapingServices.getRateMyProfLinks(profs,department);
    let toWrite = {};
    toWrite[department] = rateMyProfLinks;
    await ScrapingServices.write(department+"_rate_my_prof_links",toWrite);    
    res.end();
});
//3. Hand-verify that these are the links, and try to find the real ones if possible
//4. Go through the links and get all the reviews in a json
/** toddoy */
// Dropwdown for courselist if that's helpful, hit loadmoreuntil it's gone, nothing really fancy else
router.post('/scrape_reviews/:department',async function(req,res) {
    let department = req.params.department;
    let path = "data/"+department+"_rate_my_prof_links.json";
    let dirs_exists = fs.existsSync(path);
    if (!dirs_exists) {
        res.send("Haven't gotten Rate My Prof links for this department yet");
    }
    let rateMyProfLinks = await fs.promises.readFile(path);
    
    let reviews = await ScrapingServices.getReviews(rateMyProfLinks);
    let toWrite = {};
    toWrite[department] = reviews;
    await ScrapingServices.write(department+"_reviewinfo",toWrite);
    res.end();
});


module.exports = router;