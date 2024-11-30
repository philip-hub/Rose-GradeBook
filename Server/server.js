const express = require('express');
const app = express();
const port = 8080;

const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
var cors = require('cors');

require('dotenv').config();
const origin = 'http://'+(process.env.CLIENT_DOMAIN || "rhatemyprofessors");
const corsOptions = {
  origin,
  credentials: true
};
app.use(cors(corsOptions));

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));

app.use(express.urlencoded({limit: '200mb', extended: true}));

var frontendEndpoints = require('./frontendEndpoints.js');
app.use('/',frontendEndpoints);
var importEndpoints = require('./importEndpoints.js');
app.use('/import',importEndpoints);
var scrapingEndpoints = require('./scrapingEndpoints.js'); // Courses router
app.use('/scraping',scrapingEndpoints);
var applicationEndpoints = require('./applicationEndpoints.js'); // Courses router
app.use('/application',applicationEndpoints);

app.listen(port, () => {
  // Code.....
});