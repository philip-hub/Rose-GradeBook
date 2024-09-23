var express = require('express');
var router = express.Router();

const fs = require("fs");
var ImportServices = require('./Services/ImportServices.js');
var ScrapingServices = require('./Services/ScrapingServices.js');

router.post('/load_courses/:year', async function(req, res) {
    let curYear = ScrapingServices.thisYear();
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let year = req.params.year;
    console.log("Year: "+year);
    let sectionpath = "data/"+req.params.year+"/"+req.params.year+"_sectioninfo.json";    
    let coursepath = "data/"+req.params.year+"/"+req.params.year+"_courseinfo.json";
    let dirs_exists = fs.existsSync(coursepath) && fs.existsSync(sectionpath);
    if ((year == curYear+1 && ScrapingServices.curMonth() < 3)) {
        res.send("Invalid month. Too early in the year for next years schedule: "+months[curMonth()]+"\n(Correct if I'm wrong)");
        return;
    }
    if (!dirs_exists) {
        res.send("This year's courses and/or sections have not been scraped yet");
        return;
    }
    let courses = await fs.promises.readFile(coursepath);
    let sections = await fs.promises.readFile(sectionpath);

    let msg  = await ImportServices.writeCourses(JSON.parse(courses),JSON.parse(sections),year);
    res.send("Num rows written: "+msg);
});
// toddoy
// Will output the Rate My Prof reviews as JSON of comments, after which the import can be done with writeComments
router.put('/load_comments/:department', async function(req, res) {
    let department = req.params.department; // chosen from the all file or from it's own
    let fromAllScrape = req.query.fromAllScrape;
    let reviewspath = (fromAllScrape?"data/all/reviewinfo_all_depts":"data/reviewinfo_"+department)+".json";
    let dirs_exists = fs.existsSync(reviewspath);
    if (!dirs_exists) {
        res.send("This department's reviews have not been scraped yet, at least in the All or single dept file, respectively");
        return;
    }
    let reviews = JSON.parse(await fs.promises.readFile(reviewspath)).data;
    if (fromAllScrape) {
        reviews  = reviews[department];
        /**
         * we're bulkloading all three (sections -> takes -> comments) for efficiency
         * What are the network bottlenecks/requests we have to make? How to prevent N+1?
         *  One request per comment at the very least since we need to find sectoin mstch with sql query... thousands
         *  Perhaps could write a table-valued function, send over the data for a given teacher's review all at once, get back section IDs or null - would reduce to 355 which is 
         *     aight with the use of nodebacks in series with async library esp. the by professor stuff ispurely bcuz that's the way the data's already organized. 
         *     prolly could/should just go with all the reviews in a dept at a time as a possible function, but do by teacher for testing
         * if null, then make a new section
        */
    }
    reviews = Object.values(reviews).reduce(function (elem1, elem2) {
        if (!Array.isArray(elem1)) {
            elem1 = [];
            // console.log("iraishimasse 1");
        }
        if (!Array.isArray(elem2)) {
            elem2 = [];
            // console.log("iraishimasse 2");
        }
        return elem1.concat(elem2);
    });
    res.send("Num comment written: "+await ImportServices.writeComments(reviews, department));
});

// https://stackoverflow.com/questions/18275386/how-to-automatically-delete-records-in-sql-server-after-a-certain-amount-of-time
    // So the storage scheme will be that EC2 will host the 
// Create a sproc for insertiont o reject duplciates used food id as id get rid of current table

module.exports = router;