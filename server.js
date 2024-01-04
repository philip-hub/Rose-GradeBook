const express = require('express')
const app = express()
const port = 3000
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
//const formidable = require('formidable');
app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: false }));

app.use(express.static('templates'));
app.use('/images', express.static('images'));
app.use('/style', express.static('style'));
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'templates'));



function storeInfo(req, res, next) {
    // Extract the number from the request body and store it in the request object
    req.number = String(req.body.number);
    req.major = String(req.body.major);
    console.log(req.number);

    next(); // Proceed to the next middleware or route handler
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
  // Render the welcome page with the provided number
  res.render('welcome', { name: req.number, major:req.major });

  // Log that the verify page was accessed
  console.log("verify page");
});

// '/verifynumber' route
app.use('/verifycode', function (req, res, next) {
  // Access the stored number from the request object
    let vCode = req.body.vcode;
    let number = req.number;
    console.log(number);
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


app.use('/home', function (req, res, next) {
  // Access the stored number from the request object
    let vCode = req.body.vcode;
    let number = req.number;
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



app.use('/classsearch', function (req, res, next) {
  classList =["ES201","MA222"];
  search = String(req.body.search).toUpperCase();
  if (classList.includes(search)){
    res.render('classpage',{className:search});
}
  else{
    res.render('classnotfound');
  }
});

gpaList=["3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25","2.75", "2.5", "2.25", "3.56", "3.5", "3.4", "3.3", "3.25", "3.0", "2.75", "2.5", "2.25"]
app.use('/Biochemistry', function (req, res, next) {
  
  res.render('major',{major:"Biochemistry",gpa:gpaList[0]});
  
});



app.use('/Biochemistry-and-Molecular-Biology', function (req, res, next) {
  res.render('major', { major: "Biochemistry and Molecular Biology", gpa: gpaList[1] });
});

app.use('/Biology', function (req, res, next) {
  res.render('major', { major: "Biology", gpa: gpaList[2] });
});

app.use('/Biomathematics', function (req, res, next) {
  res.render('major', { major: "Biomathematics", gpa: gpaList[3] });
});

app.use('/Biomedical-Engineering', function (req, res, next) {
  res.render('major', { major: "Biomedical Engineering", gpa: gpaList[4] });
});

app.use('/Chemical-Engineering', function (req, res, next) {
  res.render('major', { major: "Chemical Engineering", gpa: gpaList[5] });
});

app.use('/Chemistry', function (req, res, next) {
  res.render('major', { major: "Chemistry", gpa: gpaList[6] });
});

app.use('/Civil-Engineering', function (req, res, next) {
  res.render('major', { major: "Civil Engineering", gpa: gpaList[7] });
});

app.use('/Computational-Science', function (req, res, next) {
  res.render('major', { major: "Computational Science", gpa: gpaList[8] });
});

app.use('/Computer-Engineering', function (req, res, next) {
  res.render('major', { major: "Computer Engineering", gpa: gpaList[9] });
});

app.use('/Computer-Science', function (req, res, next) {
  res.render('major', { major: "Computer Science", gpa: gpaList[10] });
});

app.use('/Data-Science', function (req, res, next) {
  res.render('major', { major: "Data Science", gpa: gpaList[11] });
});

app.use('/Electrical-Engineering', function (req, res, next) {
  res.render('major', { major: "Electrical Engineering", gpa: gpaList[12] });
});

app.use('/Engineering-Design', function (req, res, next) {
  res.render('major', { major: "Engineering Design", gpa: gpaList[13] });
});

app.use('/International-Studies', function (req, res, next) {
  res.render('major', { major: "International Studies", gpa: gpaList[14] });
});

app.use('/Mathematics', function (req, res, next) {
  res.render('major', { major: "Mathematics", gpa: gpaList[15] });
});

app.use('/Mechanical-Engineering', function (req, res, next) {
  res.render('major', { major: "Mechanical Engineering", gpa: gpaList[16] });
});

app.use('/Optical-Engineering', function (req, res, next) {
  res.render('major', { major: "Optical Engineering", gpa: gpaList[17] });
});

app.use('/Physics', function (req, res, next) {
  res.render('major', { major: "Physics", gpa: gpaList[18] });
});

app.use('/Software-Engineering', function (req, res, next) {
  res.render('major', { major: "Software Engineering", gpa: gpaList[19] });
});


app.listen(port, () => {
  // Code.....
 
})
