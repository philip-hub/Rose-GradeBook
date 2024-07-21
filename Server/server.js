const express = require('express');
const app = express();
const port = 8080;

const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const session = require('express-session');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));

app.use(session({
  secret: 'your_secret_key', // A secret key for signing the session ID cookie
  resave: false,              // Forces the session to be saved back to the session store
  saveUninitialized: true,    // Forces a session that is "uninitialized" to be saved to the store
  cookie: { maxAge: 7200000 } //in seconds this is 2 hours
}));

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