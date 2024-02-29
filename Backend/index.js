var express = require("express");
var app = express();
// var favicon = require('serve-favicon');
// var path = require('path');
var cors = require('cors');
app.use(cors());
app.use('/static', express.static("public"));
// app.use(favicon(path.join(__dirname, 'favicon.ico')))

var importEndpoints = require('./importEndpoints.js');
app.use('/import_data',importEndpoints);
var scrapingEndpoints = require('./scrapingEndpoints.js'); // Courses router
app.use('/scraping',scrapingEndpoints);


app.listen(8080);