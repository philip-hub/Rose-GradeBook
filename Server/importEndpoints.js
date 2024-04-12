var express = require('express');
var router = express.Router();

const fs = require("fs");
var ImportServices = require('./Services/ImportServices.js');
var ScrapingServices = require('./Services/ScrapingServices.js');

router.post('/load_courses/:year', async function(req, res) {
    let curYear = ScrapingServices.thisYear();
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    let year = req.params.year;
    let sectionpath = "data/"+req.params.year+"/"+req.params.year+"_sectioninfo.json";    
    let coursepath = "data/"+req.params.year+"/"+req.params.year+"_courseinfo.json";
    let dirs_exists = fs.existsSync(coursepath) && fs.existsSync(sectionpath);
    if ((year == curYear+1 && ScrapingServices.curMonth() < 3)) {
        res.send("Invalid month. Too early in the year for next years schedule: "+months[curMonth()]+"\n(Correct if I'm wrong)");
    }
    if (!dirs_exists) {
        res.send("This year's courses and/or sections have not been scraped yet");
    }
    let courses = await fs.promises.readFile(coursepath);
    let sections = await fs.promises.readFile(sectionpath);

    let msg  = await ImportServices.writeCourses(JSON.parse(courses),JSON.parse(sections),year);
    res.send("Num rows written: "+msg);
});
// toddoy
// Will output the Rate My Prof reviews as JSON of comments, after which the import can be done with writeComments
router.put('/rate_my_prof_reviews_to_comments/:department', async function(req, res) {
    let department = req.params.department;
    let reviewspath = "data/"+department+"_reviewinfo.json";
    let dirs_exists = fs.existsSync(coursepath) && fs.existsSync(reviewspath);
    if (!dirs_exists) {
        res.send("This department's reviews have not been scraped yet");
    }
    let reviews = await fs.promises.readFile(reviewspath);

    let comments  = await ImportServices.convertReviewsToComments(JSON.parse(reviews),department);

});
// toddoy
router.post('/load_comments/:department', async function(req, res) {
    let department = req.params.department;
    let commentspath = "data/"+department+"_comments.json";
    let dirs_exists = fs.existsSync(commentspath);
    if (!dirs_exists) {
        res.send("This department's commentspath have not been converted yet");
    }
    let comments = await fs.promises.readFile(commentspath);
    let msg  = await ImportServices.writeComments(JSON.parse(comments));
    res.send("Num rows written: "+msg);
});

// https://stackoverflow.com/questions/18275386/how-to-automatically-delete-records-in-sql-server-after-a-certain-amount-of-time
    // So the storage scheme will be that EC2 will host the 
// Create a sproc for insertiont o reject duplciates used food id as id get rid of current table

module.exports = router;