var express = require('express');
var router = express.Router();

var ImportServices = require('./Services/ImportServices.js');

router.get('/courses/', function(req, res) {
    let imported = ImportServices.importCourses();
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