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

// Update
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

module.exports = router;