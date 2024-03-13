var express = require('express');
var router = express.Router();

var ImportServices = require('./Services/ImportServices.js');
var ScrapingServices = require('./Services/ScrapingServices.js');

router.get('/courses/:year', async function(req, res) {
    let imported = ImportServices.writeCourses(await ScrapingServices.getCourses(req.params.year));
    if (imported) {
        res.send("Courses Imported Successfully");
    } else {
        res.send("Course Import Failed");
    }
});

// https://stackoverflow.com/questions/18275386/how-to-automatically-delete-records-in-sql-server-after-a-certain-amount-of-time
    // So the storage scheme will be that EC2 will host the 
// Create a sproc for insertiont o reject duplciates used food id as id get rid of current table

module.exports = router;