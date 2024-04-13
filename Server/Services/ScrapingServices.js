var express = require('express');
var router = express.Router();
const fs = require("fs");
const { get } = require('http');
const { getDefaultAutoSelectFamilyAttemptTimeout } = require('net');
const { DateTime } = require("luxon");
var puppeteer = require('puppeteer');
const { all } = require('../applicationEndpoints');

//#region Rose/Banner Scraping
// Returns courses
function course_factory (id, dept, name) {
    return {
        cid:id,
        department:dept,
        cname:name,
    }
}

// Returns specific sections of courses
function section_factory (id, name, secton, teacher, credits, semester, term) {
    return {
        cid:id,
        cname:name,
        section:secton,
        professor:teacher,
        credit_hours:credits,
        quarter:semester,
        year:term,
    }
}

const bannerSite = 'https://prodwebxe-hv.rose-hulman.edu/regweb-cgi/reg-sched.pl';
function publicSite(year) { 
    return 'https://www.rose-hulman.edu/academics/course-catalog/'+year+'/index.html';
};
const majorsSite = 'https://www.rose-hulman.edu/academics/degrees-and-programs/majors.html';
// We can get the last five years' course sites (all that matter) by subbing in 'xxxx-yyyy' where 'current' is, e.g., https://www.rose-hulman.edu/academics/course-catalog/2022-2023/index.html

const archivedBannerSite = "data/old_banner_site.html"; // uses publicly
const archivedPublicSite = "data/old_public_site.html"; // storing all publicly listed courses

async function bannerSiteUp(username, password) {
    // puppeteering
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    // Banner web schedule site
    await page.goto(bannerSite, { timeout: 30000 } );

    // Inputting username/password
    await page.click('input[id="usernameUserInput"]');
    await page.keyboard.type(username, {delay: 100});
    await page.click('input[id="password"]');
    await page.keyboard.type(password, {delay: 100});

    // await page.screenshot({path: 'files/screenshot.png'});
    
    // Logging in
        // await page.click("[type=\"submit\"]");
        // await page.click(".form-group > .form-actions");
    await page.keyboard.press('Enter');
    
    // await page.screenshot({path: 'files/screenshot2.png'});
    
    // Waiting for schedule page to load
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Waited");

    // await page.screenshot({path: 'files/screenshot3.png'});

    // await browser.close();
    let content = await page.content();
    return content;
}

async function publicSiteUp() {
    // puppeteering
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    // Public course listing site
    const response = await page.goto(publicSite("current"), { timeout: 30000 } ); // for scraping add options like network2 or whatever; we can vary getting the source html (like in this case) or getting what the user actually sees after some js shenanigans with these options
    let content = await response.text();

    // await page.screenshot({path: 'files/screenshot4.png'});
    // console.log("Search results: "+ await page.$("#search-results").toString());
    // await browser.close();
    return content;
}


async function getSections(year) {
    // puppeteering
    const browser = await puppeteer.launch({
        headless: false,
      });
    const page = await browser.newPage();
    // Banner web schedule site
    await page.goto(bannerSite, { timeout: 30000,
        waitUntil: "networkidle2"
      });
      await waitSeconds(60); // very jank fix lol, slows down scraping a lol; this where I manually log in with 2FA
      console.log("LOG IN WITH 2FA IN 30 SECONDS CHALLENGE");

    
    await page.screenshot({path: 'screenshot3.png'});
    // Inputting username/password is now manual
/*    await page.click('input[id="usernameUserInput"]');
    await page.keyboard.type(username, {delay: 100});
    await page.click('input[id="password"]');
    await page.keyboard.type(password, {delay: 100});

    await page.keyboard.press('Enter');
    
    // Waiting for schedule page to load
    await new Promise(resolve => setTimeout(resolve, 1000));*/

    // await page.screenshot({path: 'files/screenshot7.png'});

    // document.querySelector("[name=\"termcode\"] option").innerText
        // The dropdown in question
    let toChoose = await getOptions(page, year);
    let departments = await getDepartments(page);
    let toRet = {};
    for (let key in toChoose) {
        await getOptionSections(page, year, key, toChoose, departments, toRet);
    }

    // Leaving and coming back to reset the site works
        // await page.goto(publicSite("current"), { timeout: 30000 } );
        // await page.screenshot({path: 'files/screenshot8.png'});
        // await page.goto(bannerSite, { timeout: 30000 } );
        // await page.screenshot({path: 'files/screenshot9.png'});
    return toRet;
}

async function getOptionSections(page, year, quarter, toChoose, departments, toRet) {
    toRet[quarter] = {};

    let option = toChoose[quarter];
    // Goes through all courses by department
    for (let i = 0; i < departments.length; i++) {
        // Set the quarter to the given option
        await page.select("[name=\"termcode\"]",option);
        // Set table (choose "table")
        await page.select("[name=\"view\"]","table");
        // set current department
        await page.select("[name=\"deptid\"]",departments[i]); // as long as this was selected last, enter will work

        // Clickin in
        await page.click("[name=\"deptid\"]"); // clicks dropdown after selecting
        await page.keyboard.press('Enter'); // press enter
        await new Promise(resolve => setTimeout(resolve, 3000)); // An estimated boun
        if (i == 0) {
            console.log("Saving Biology and Biomedical Engineering");
            // await page.screenshot({path: 'files/screenshot10.png'}); // should be 
        }
        console.log("toRet length before: "+toRet.length);
        await getPageSections(page, year, quarter, toRet);
        console.log("toRet length after: "+toRet.length);
        // Reset page via repeat goto banner url after each scrape
        await page.goto(bannerSite, { timeout: 30000 } );
    }
}

async function getPageSections(page, year, quarter, toRet) {
    const nn = await page.$$("p table tr td");
    const colnums = {
        "Course":0,
        "CRN":1,
        "Course Title":2,
        "Instructor":3,
        "CrHrs":4,
        "Enrl":5,
        "Cap":6,
        "Term Schedule":7,
        "Comments":8,
        "Final Exam Schedule":9,
        "Term Dates":10,
    };
    const numCols = 11;
    for (let i = 0; i < nn.length; i+=numCols) { // skip that first row since it just has col names
        // await( await option.getProperty('innerText') ).jsonValue();
        const c = await( await nn[i+colnums["Course"]].getProperty('innerText') ).jsonValue();
        const id = c.substring(0,c.indexOf('-')); // All but "-XX"
        const name = await( await nn[i+colnums["Course Title"]].getProperty('innerText') ).jsonValue();
        const section = c.substring(c.indexOf('-')+1);
        const professor = await( await nn[i+colnums["Instructor"]].getProperty('innerText') ).jsonValue();
        const credit_hours = await( await nn[i+colnums["CrHrs"]].getProperty('innerText') ).jsonValue();
        // (id, name, secton, teacher, semester, term)
        let toPush = section_factory(id,name,section,professor,credit_hours,quarter,year);
        // if (i == 0) {
        //     console.log(toPush);
        // }
        if (!toRet[quarter][id]) {
            toRet[quarter][id] = [];
        }
        toRet[quarter][id].push(toPush);
    }
}

// Returns option values for selecting in dropdown
async function getDepartments(page) {
    let allOptions = await page.$$("[name=\"deptid\"] option");
    let toRet = [];
    for (let i = 1; i < allOptions.length; i++) { // skips the first because we're assuming it's empty; won't have a value and will crash
        const option = allOptions[i];
        const val = await( await option.getProperty('value') ).jsonValue();
        toRet.push(val);
    }
    return toRet;
}

async function getOptions(page, year) {
    const allOptions = await page.$$("[name=\"termcode\"] option");
    let toChoose = {};
    let found = false;
    for (let i = 0; i < allOptions.length; i++) { // Could implement a binary search, would be a major pain tho for an array of size 20
        const option = allOptions[i];
        const val = await( await option.getProperty('value') ).jsonValue();
        const name = await( await option.getProperty('innerText') ).jsonValue();
        let curYear = val.substring(0,4);
        if (!found) {
            if (curYear < year && i === 0) { // So if even the (presumably) latest part of the list has not happened yer
                break;
            }
            if (curYear == year) {
                toChoose[name.substring(0,name.length-18)] = val; // Gives the quarter
                found = true;
            }
        } else {
            if (curYear != year) { // we found all of them
                break;
            }
            toChoose[name.substring(0,name.length-18)] = val;
        }
    }
    return toChoose;
}

async function getCourses(year) {
    // puppeteering
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    // Public course listing site
    console.log("going to: "+publicSite(year));
    await page.goto(publicSite(year), { timeout: 30000,waitUntil:"networkidle2" } ); // for scraping add options like network2 or whatever; we can vary getting the source html (like in this case) or getting what the user actually sees after some js shenanigans with these options

    // await page.screenshot({path: 'files/screenshot5.png'});
    
    let toRet = [];
    let loop = true;
    let length = await page.evaluate(() => {
        return (Array.from(document.querySelector('#courses').children).length);
    });
    while (loop) {
        // Adds the courses of the current page to the list
        await getPageCourses(page,toRet);
        await page.click("[ng-click=\"setCurrent(pagination.current + 1)\"]");
        loop = await hasNext(page,length);
    }
    await getPageCourses(page,toRet);

    return toRet;
}

async function getMajors() {
    // puppeteering
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    // Public course listing site
    console.log("going to: "+majorsSite);
    await page.goto(majorsSite, { timeout: 30000,waitUntil:"networkidle2" } ); // for scraping add options like network2 or whatever; we can vary getting the source html (like in this case) or getting what the user actually sees after some js shenanigans with these options

    // await page.screenshot({path: 'files/screenshot5.png'});
    
    let toRet = [];
    const nn = await page.$$(".container-style-basic-block-three-columns .content-block-title");
    for (let i = 0; i < nn.length; i++) {
        const n = nn[i];
        const t = await( await n.getProperty('innerText') ).jsonValue(); // evaluate did not work in this scenario, don't 100% get why this does
        toRet.push(t);
    }

    return toRet;
}

// Length changed because no longer at limit of course length
async function hasNext(page, oldLen) {
    // return !!(await page.$("[ng-click=\"setCurrent(pagination.current + 1)\"]"));
    let length = await page.evaluate(() => {
        return (Array.from(document.querySelector('#courses').children).length);
    });
    return oldLen == length;
}

async function getPageCourses(page, toRet) {
    const nn = await page.$$("#courses .ng-binding");
    for (let i = 0; i < nn.length; i++) {
        const n = nn[i];
        // https://stackoverflow.com/questions/59001256/pupetteer-get-inner-text-returns-jshandle-prefix
        const t = await( await n.getProperty('innerText') ).jsonValue(); // evaluate did not work in this scenario, don't 100% get why this does
        const id_and_name = t.split("\n");
        const dept_and_number = id_and_name[0].split(" ");

        // console.log("id and name: "+id_and_name);
        // console.log("dept and number: "+dept_and_number);
        // await browser.close();
        if (dept_and_number[1] && dept_and_number[0] && id_and_name[1]) { // prvents incomplete course data
            toRet.push(course_factory(dept_and_number[1],dept_and_number[0],id_and_name[1])); // id, dept, name
        }
    }
}

async function writeCourses(courses, year) {
    let filepath = "data/"+year+"/";
    let filename = year+"_courseinfo";
    let data = {};
    let courseset = {};
    for (let i = 0; i < courses.length; i++) {
        let cid = courses[i].cid;
        let cur_dept = courses[i].department;
        let cname = courses[i].cname;
        courseset[cur_dept+cid] = cur_dept; // so we can split by the prefixes

        let cur = {};
        if (cur_dept in data) {
            cur = data[cur_dept];
        }
        // update object
        cur[cid] = cname;
        // update object
        data[cur_dept] = cur;
    }

    // Lol it's like a demo of synchronous vs promises vs callbacks
    let dir_exists = fs.existsSync(filepath);
    if (!dir_exists) { // If the directory already exists
        await fs.promises.mkdir(filepath,{ recursive: true });
    }
    fs.writeFile(filepath+filename+".json", JSON.stringify(data), function(err, buf ) {
        if(err) {
            console.log("error: ", err);
        } else {
            console.log("Data saved successfully!");
        }
    });
    fs.writeFile(filepath+filename+"_courseset.json", JSON.stringify(courseset), function(err, buf ) {
        if(err) {
            console.log("error: ", err);
        } else {
            console.log("Data saved successfully!");
        }
    });
}

// TODO: Make writing a little more sophisticated
async function writeSections(sections, year) {
    let filepath = "data/"+year+"/";
    let filename = year+"_sectioninfo";
    let data = {sections};

    // Lol it's like a demo of synchronous vs promises vs callbacks
    let dir_exists = fs.existsSync(filepath);
    if (!dir_exists) { // If the directory already exists
        await fs.promises.mkdir(filepath,{ recursive: true });
    }
    fs.writeFile(filepath+filename+".json", JSON.stringify(data), function(err, buf ) {
        if(err) {
            console.log("error: ", err);
        } else {
            console.log("Data saved successfully!");
        }
    });
}

async function writeMajors(majors) {
    let filepath = "data/";
    let filename = "majorinfo";
    let data = {majors};

    // Lol it's like a demo of synchronous vs promises vs callbacks
    let dir_exists = fs.existsSync(filepath);
    if (!dir_exists) { // If the directory already exists
        await fs.promises.mkdir(filepath,{ recursive: true });
    }
    fs.writeFile(filepath+filename+".json", JSON.stringify(data), function(err, buf ) {
        if(err) {
            console.log("error: ", err);
        } else {
            console.log("Data saved successfully!");
        }
    });
}
//#endregion

/** toddoy */
//#region Rate My Prof Scraping
const roseRateMyProfSite = "https://www.ratemyprofessors.com/search/professors/820";

/** toddoy */
async function getRateMyProfLinks(profs) {
    // puppeteering
    // const browser = await puppeteer.launch({headless: "new"});
    const browser = await puppeteer.launch({
        headless: false,
      });
    const page = await browser.newPage();
    // Public course listing site
    const response = await page.goto(roseRateMyProfSite, { timeout: 0, waitUntil:"networkidle2" } ); // for scraping add options like network2 or whatever; we can vary getting the source html (like in this case) or getting what the user actually sees after some js shenanigans with these options
    // let content = await response.text();
    await waitSeconds(5); // Time in which to select the department
    // await page.screenshot({path: 'files/screenshot4.png'});
    // console.log("Search results: "+ await page.$("#search-results").toString());
    // await browser.close();
    let showMoreButton = await page.$(".Buttons__Button-sc-19xdot-1"); // document.querySelectorAll(".Buttons__Button-sc-19xdot-1")
    let i = 0;
    let allTeachers = [];
    while (showMoreButton) { // looks llike it can get stuck and need a manual click every once in a while
        allTeachers = (await page.$$("a.TeacherCard__StyledTeacherCard-syjs0d-0.dLJIlx"));
        console.log("NumallTeachers: "+i);i++;
        try {
        await page.click(".Buttons__Button-sc-19xdot-1", {delay: 1000});
        } catch {
            // await waitSeconds(1);
            // continue;
            break;
        }
        showMoreButton = await page.$(".Buttons__Button-sc-19xdot-1");
    }
    allTeachers = (await page.$$("a.TeacherCard__StyledTeacherCard-syjs0d-0.dLJIlx"));
    return await getNamesAndLinks(allTeachers);
}
/** toddoy */
async function getNamesAndLinks(allTeachers) {
    let toRet = [];

    for (let i = 0; i < allTeachers.length; i++) { // skip that first row since it just has col names
        // await( await option.getProperty('iallTeacherserText') ).jsonValue();
        const teacher = allTeachers[i];
        const val = await( await teacher.getProperty('href') ).jsonValue();
        toRet.push(val);
    }
    return toRet;
}
/** toddoy */
/**
Review Schema: Quality, Difficulty, For Credit, Attendance, Would Take Again, 
                  Grade, Textbook, SourceLink, Tags, Likes, Dislikes, Dates, Course, 
                  Prof Name
 */
async function getReviews(rateMyProfLinks) {
    // puppeteering
    const browser = await puppeteer.launch({headless: "new"});
    const page = await browser.newPage();
    // Public course listing site
    const response = await page.goto(publicSite("current"), { timeout: 30000 } ); // for scraping add options like network2 or whatever; we can vary getting the source html (like in this case) or getting what the user actually sees after some js shenanigans with these options
    let content = await response.text();

    // await page.screenshot({path: 'files/screenshot4.png'});
    // console.log("Search results: "+ await page.$("#search-results").toString());
    // await browser.close();
    return content;
}
//#endregion

//#region Helpers
async function write(filename,data) {
    let filepath = "data/";
    data = {data};

    // Lol it's like a demo of synchronous vs promises vs callbacks
    let dir_exists = fs.existsSync(filepath);
    if (!dir_exists) { // If the directory already exists
        await fs.promises.mkdir(filepath,{ recursive: true });
    }
    fs.writeFile(filepath+filename+".json", JSON.stringify(data), function(err, buf ) {
        if(err) {
            console.log("error: ", err);
        } else {
            console.log("Data saved successfully!");
        }
    });
}

function curMonth(){
    return DateTime.now().month;
}

function thisYear(){
    return DateTime.now().year;
}

const waitSeconds = (n) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("5 seconds passed");
            resolve("Finished waiting!");
        }, n*1000);
    });
}
//#endregion

exports.getCourses = getCourses;
exports.bannerSiteUp = bannerSiteUp;
exports.publicSiteUp = publicSiteUp;
exports.thisYear = thisYear;
exports.curMonth = curMonth;
exports.writeCourses = writeCourses;
exports.getSections = getSections;
exports.writeSections = writeSections;
exports.getMajors = getMajors;
exports.writeMajors = writeMajors;
exports.getRateMyProfLinks = getRateMyProfLinks;
exports.getReviews = getReviews;
exports.write = write;