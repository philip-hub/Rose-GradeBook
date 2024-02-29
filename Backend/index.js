var express = require("express");
var app = express();
// var favicon = require('serve-favicon');
// var path = require('path');
var cors = require('cors');
app.use(cors());
app.use(express.json({limit: '200mb'}));
// For parsing application/x-www-form-urlencoded
    // app.use(.urlencoded({ extended: true }));
app.use(express.urlencoded({limit: '200mb', extended: true}));

var importEndpoints = require('./importEndpoints.js');
app.use('/import_data',importEndpoints);
var scrapingEndpoints = require('./scrapingEndpoints.js'); // Courses router
app.use('/scraping',scrapingEndpoints);


app.listen(8080);