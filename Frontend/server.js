const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const session = require('express-session');
//const formidable = require('formidable');
app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: false }));

app.use(express.static('templates'));
app.use('/images', express.static('images'));
app.use('/style', express.static('style'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));

const jsonData = require('./2024_courseinfo_courseset.json'); // Adjust the path as necessary
// console.log(jsonData);

app.use(session({
  secret: 'your_secret_key', // A secret key for signing the session ID cookie
  resave: false,              // Forces the session to be saved back to the session store
  saveUninitialized: true,    // Forces a session that is "uninitialized" to be saved to the store
  cookie: { maxAge: 7200000 } //in seconds this is 2 hours
}));


function storeInfo(req, res, next) {
    req.number = String(req.body.number);
    req.major = String(req.body.major);
    console.log(req.number);
    next(); 
}


// Render Html File
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'templates/index.html'));
});

app.post('/signup', function (req,res){
  console.log("signup page")
  res.sendFile(path.join(__dirname, 'templates/signup.html'));
  //res.send(makeSignUpPage())
  //res.send(makeVerificationPage())
});


app.use('/verify', storeInfo, function (req, res, next) {
  req.session.number = req.number;
  req.session.major = req.major;
  res.render('welcome', { name: req.number, major:req.major });

  // Log that the verify page was accessed
  console.log("verify page");
});

// '/verifynumber' route
app.use('/verifycode',storeInfo, function (req, res, next) {
  // Access the stored number from the request object
    const vCode = req.body.vcode;
    const number = req.session.number;
    const major = req.session.major;
    console.log(String(number));
    // Extract the number from the request body
    gpaList=["3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25"]
    freshmanGPA = 3.75
    sophomoreGPA = 3.4
    juniorGPA = 3.25
    seniorGPA = 3.0
    roseHulmanGPA=3.2
    
    console.log(vCode);
    
  if(vCode == 3480){
    // Render the welcome page with the provided number
      res.render('home',{ fgpa:String(freshmanGPA)+"🥱", spgpa:String(sophomoreGPA)+"🙃", jgpa:String(juniorGPA)+"🫠", sngpa:String(seniorGPA)+"🫣", rgpa:String(roseHulmanGPA)+"🥶", bcgpa:3.21, bgpa: gpaList[0], bcmgpa: gpaList[1], bgpa: gpaList[2], bmgpa: gpaList[3], bgpa: gpaList[4], begpa: gpaList[5], chemegpa: gpaList[6], chemgpa: gpaList[7], cegpa: gpaList[8], cpsgpa: gpaList[9], cpegpa: gpaList[10], csgpa: gpaList[11], dsgpa: gpaList[12], eegpa: gpaList[13], edgpa: gpaList[14], isgpa: gpaList[15],mgpa: gpaList[16], megpa: gpaList[17], opgpa: gpaList[18], phgpa: gpaList[19], segpa: gpaList[20]  });
    }
      else{
      res.render('reverify')
    }
    // Log that the verify page was accessed
    console.log("verify page");
});


app.use('/home',storeInfo, function (req, res, next) {
  // Access the stored number from the request object
    let vCode = req.body.vcode;
    const number = req.session.number;
    const major = req.session.major;
    console.log(number);
    // Extract the number from the request body
    gpaList=["3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25"]
    freshmanGPA = 3.75
    sophomoreGPA = 3.4
    juniorGPA = 3.25
    seniorGPA = 3.0
    roseHulmanGPA=3.2

    console.log(vCode);


    // Render the welcome page with the provided number
    res.render('home',{ fgpa:String(freshmanGPA)+"🥱", spgpa:String(sophomoreGPA)+"🙃", jgpa:String(juniorGPA)+"🫠", sngpa:String(seniorGPA)+"🫣", rgpa:String(roseHulmanGPA)+"🥶", bcgpa:3.21, bgpa: gpaList[0], bcmgpa: gpaList[1], bgpa: gpaList[2], bmgpa: gpaList[3], bgpa: gpaList[4], begpa: gpaList[5], chemegpa: gpaList[6], chemgpa: gpaList[7], cegpa: gpaList[8], cpsgpa: gpaList[9], cpegpa: gpaList[10], csgpa: gpaList[11], dsgpa: gpaList[12], eegpa: gpaList[13], edgpa: gpaList[14], isgpa: gpaList[15],mgpa: gpaList[16], megpa: gpaList[17], opgpa: gpaList[18], phgpa: gpaList[19], segpa: gpaList[20]  });

});



app.use('/classsearch',storeInfo, function (req, res, next) {
  classList =["ES201","MA222"];
  const number = req.session.number;
  const major = req.session.major;
  search = String(req.body.search).toUpperCase();
  const courseExists = search in jsonData;
  if (courseExists){
    res.render('classpage',{className:search,number:number});
}
  else{
    res.render('classnotfound');
  }
});

gpaList=["3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25"]
app.use('/Biochemistry', function (req, res, next) {
  const BIOClasses = Object.keys(jsonData).filter(key => jsonData[key] === "BIO");
  res.render('major',{major:"Biochemistry",gpa:gpaList[0],classes:BIOClasses});
  
});



app.use('/Biochemistry-and-Molecular-Biology', function (req, res, next) {
  const BIOClasses = Object.keys(jsonData).filter(key => jsonData[key] === "BIO");
  res.render('major', { major: "Biochemistry and Molecular Biology", gpa: gpaList[1],classes:BIOClasses });
});

app.use('/Biology', function (req, res, next) {
  const BIOClasses = Object.keys(jsonData).filter(key => jsonData[key] === "BIO");
  res.render('major', { major: "Biology", gpa: gpaList[2],classes:BIOClasses });;
});

app.use('/Biomathematics', function (req, res, next) {
  const BMTHClasses = Object.keys(jsonData).filter(key => jsonData[key] === "BMTH");
  res.render('major', { major: "Biomathematics", gpa: gpaList[3],classes:BMTHClasses });
});

app.use('/Biomedical-Engineering', function (req, res, next) {

  const BEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "BE");
  res.render('major', { major: "Biomedical Engineering", gpa: gpaList[4],classes:BEClasses });;
});

app.use('/Chemical-Engineering', function (req, res, next) {
  const CHEMEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "CHE");
  res.render('major', { major: "Chemical Engineering", gpa: gpaList[5],classes:CHEMEClasses });
});

app.use('/Chemistry', function (req, res, next) {
  const CHEMClasses = Object.keys(jsonData).filter(key => jsonData[key] === "CHEM");
  res.render('major', { major: "Chemistry", gpa: gpaList[6],classes:CHEMClasses });;
});

app.use('/Civil-Engineering', function (req, res, next) {
  const CEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "CE");
  res.render('major', { major: "Civil Engineering", gpa: gpaList[7],classes:CEClasses });
});

app.use('/Computational-Science', function (req, res, next) {
  const MAClasses = Object.keys(jsonData).filter(key => jsonData[key] === "MA");
  res.render('major', { major: "Computational Science", gpa: gpaList[8],classes:MAClasses });
});

app.use('/Computer-Engineering', function (req, res, next) {
  const ECEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "ECE");
  res.render('major', { major: "Computer Engineering", gpa: gpaList[9],classes:ECEClasses });
});

app.use('/Computer-Science', function (req, res, next) {
  const CSSEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "CSSE");
  res.render('major', { major: "Computer Science", gpa: gpaList[10],classes:CSSEClasses });
});

app.use('/Data-Science', function (req, res, next) {
  const CSSEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "CSSE");
  res.render('major', { major: "Data Science", gpa: gpaList[11],classes:CSSEClasses });
});

app.use('/Electrical-Engineering', function (req, res, next) {
  const ECEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "ECE");
  res.render('major', { major: "Electrical Engineering", gpa: gpaList[12],classes:ECEClasses });
});

app.use('/Engineering-Design', function (req, res, next) {
  const ENGDClasses = Object.keys(jsonData).filter(key => jsonData[key] === "ENGD");
  res.render('major', { major: "Engineering Design", gpa: gpaList[13],classes:ENGDClasses});
});

app.use('/International-Studies', function (req, res, next) {
  const IAClasses = Object.keys(jsonData).filter(key => jsonData[key] === "IA");
  res.render('major', { major: "International Studies", gpa: gpaList[14],classes:IAClasses });
});

app.use('/Mathematics', function (req, res, next) {
  const MAClasses = Object.keys(jsonData).filter(key => jsonData[key] === "MA");
  res.render('major', { major: "Mathematics", gpa: gpaList[15],classes:MAClasses});
});

app.use('/Mechanical-Engineering', function (req, res, next) {
  const MEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "ME");
  res.render('major', { major: "Mechanical Engineering", gpa: gpaList[16],classes:MEClasses});
});

app.use('/Optical-Engineering', function (req, res, next) {
  const OEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "OE");
  res.render('major', { major: "Optical Engineering", gpa: gpaList[17],classes:OEClasses });
});

app.use('/Physics', function (req, res, next) {
  const PHClasses = Object.keys(jsonData).filter(key => jsonData[key] === "PH");
  res.render('major', { major: "Physics", gpa: gpaList[18],classes:PHEClasses });
});

app.use('/Software-Engineering', function (req, res, next) {
  const CSSEClasses = Object.keys(jsonData).filter(key => jsonData[key] === "CSSE");
  res.render('major', { major: "Software Engineering", gpa: gpaList[19],classes:CSSEClasses });
});


app.listen(port, () => {
  // Code.....
 
})
