// Method prefixes
    // Create - Write to DB
    // Read - Pull from DB
        // Could be plural
    // Update - Update in DB

var express = require('express');
var router = express.Router();
const fs = require("fs");
var ConnectionM = require('tedious').Connection;
var RequestM = require('tedious').Request;
var types = require('tedious').TYPES;
const { DateTime } = require("luxon");

//#region CRUD

//#region Users

// TODO AddParameters and change names to match actual sprocs
    //    - Also username and password minimum length, email formatting should be checked with https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/email
    //      - Email blacklist json cross referenced
    //    - Add to the table whether or not why’re verified and salt stuff for email and password
    // b. Generate code and send to email
    //    - Even without send to email, create a table that has users and the genereated code; deleted upon new code gen or successful verification
async function createUser (email,username,password,gpa,standing,isadmin,majors,validationcode) { // returns user id for session

    if (!checkValidMajors(majors)) {
        return generateMessage(false,"One or more majors entered incorrectly");
    }

    let connection = await getNewConnection(false,false);

    const request = new RequestM('insertUser', (err, rowCount) => {
        if (err) { 
            return generateMessage(false,err);
        }
        connection.close();
    });
    // (@email varchar(35),@username varchar(10),
    // @password varchar(50),@gpa decimal, @standing varchar(10),
    // @isadmin bit,@majors varchar(150),@validationcode CHAR(4),
    // @userid INT OUTPUT)
    request.addParameter('email', types.VarChar, email);
    request.addParameter('username', types.VarChar, username);
    request.addParameter('password', types.VarChar, password);
    request.addParameter('gpa', types.Decimal, gpa);
    request.addParameter('standing', types.VarChar, standing);
    request.addParameter('isadmin', types.Bit, booleanToBit(isadmin));
    request.addParameter('majors', types.VarChar, majors);
    request.addParameter('validationcode', types.Char, validationcode);
    request.addOutputParameter('userid', types.Int);

    // console.log(request);

    // In SQL Server 2000 you may need: connection.execSqlBatch(request);
    connection.callProcedure(request);

    request.on('error', function (err) {
        return generateMessage(false,err);
    });

    let userid = await callProcedureRequestOutputParamPromise (request);// this makes sense; it isn't sequential, it speedruns through and waits for both
    let retval = await callProcedureRequestFinalReturnPromise (request);
    return generateMessage(retval==0,retval==0?userid:"Error message; todo, implement varied error messages based on the return value: "+retval);
}
async function readUser (userid) {
    let toRet = [];

        const connection = await getNewConnection(false,true);

        let sql = 'select * from Users where UserID = @userid';
        let request = new RequestM(sql, function (err, rowCount, rows) {
            if (err) {
                return generateMessage(false,err);
            }
        });

        request.addParameter('userid', types.Int, userid);
        connection.execSql(request);

        let rows2 = await execSqlRequestDonePromise (request);
        console.log("user id"+userid);
        console.log("user id"+rows2);
        rows2.forEach((columns) => {
            let toPush = 
            convertFromUserSchema(columns);
            toRet.push(toPush);
        });
        
        // Here's the magic: the then() function returns a new promise, different from the original:
            // So if we await that then we're good on everything in the thens
        return generateMessage(toRet.length==1,toRet.length==1?toRet[0]:"Didn't return 1 user");
}
async function updateUser (userid,password,gpa,standing,isadmin,isvalidated,majors) {
    if (!checkValidMajors(majors)) {
        return generateMessage(false,"One or more majors entered incorrectly");
    }

    let connection = await getNewConnection(false,false);

    const request = new RequestM('updateProfile', (err, rowCount) => {
        if (err) { 
            return generateMessage(false,err);
        }
        connection.close();
    });
    // @userid int,
    // @password varchar(50),@gpa decimal, 
    // @standing varchar(10),@isadmin bit,
    // @isvalidated bit,@majors varchar(150))
    request.addParameter('userid', types.Int, userid);
    request.addParameter('password', types.VarChar, password);
    request.addParameter('gpa', types.Decimal, gpa);
    request.addParameter('standing', types.VarChar, standing);
    request.addParameter('isadmin', types.Bit, booleanToBit(isadmin));
    request.addParameter('isvalidated', types.Bit, booleanToBit(isvalidated));
    request.addParameter('majors', types.VarChar, majors);

    // In SQL Server 2000 you may need: connection.execSqlBatch(request);
    connection.callProcedure(request);

    request.on('error', function (err) {
        return generateMessage(false,err);
    });

    let retval = await callProcedureRequestFinalReturnPromise (request);
    return generateMessage(retval==0,retval==0?"Successfully updated profile!":"Error message; todo, implement varied error messages based on the return value: "+retval);
}
async function updatePassword(password,userid,newPassword){
    let connection = await getNewConnection(false,false);

    const request = new RequestM('changePassword', (err, rowCount) => {
        if (err) { 
            return generateMessage(false,err);
        }
        connection.close();
    });
// (@password varchar(50), @userid int, @newPassword varchar(50))
    request.addParameter('password', types.VarChar, password);
    request.addParameter('userid', types.Int, userid);
    request.addParameter('newPassword', types.VarChar, newPassword);

    // In SQL Server 2000 you may need: connection.execSqlBatch(request);
    connection.callProcedure(request);

    request.on('error', function (err) {
        return generateMessage(false,err);
    });

    let retval = await callProcedureRequestFinalReturnPromise (request);
    return generateMessage(retval==0,retval==0?"Successfully updated password!":"Error message; todo, implement varied error messages based on the return value: "+retval);
}

//#endregion

//#region Takes

// 2b. Insert Takes (user-specific)

async function createTake (userid,courseid,grade) { // returns user id for session
    let connection = await getNewConnection(false,false);

    const request = new RequestM('insertUpdateTakes', (err, rowCount) => {
        if (err) { 
            return generateMessage(false,err);
        }
        connection.close();
    });

    // @userid INT,@courseid INT,@grade DECIMAL
    request.addParameter('userid', types.Int, userid);
    request.addParameter('courseid', types.Int, courseid);
    request.addParameter('grade', types.Decimal, grade);

    // In SQL Server 2000 you may need: connection.execSqlBatch(request);
    connection.callProcedure(request);

    request.on('error', function (err) {
        return generateMessage(false,err);
    });

    let retval = await callProcedureRequestFinalReturnPromise (request);
    return generateMessage(retval==0,retval==0?"Successfully added/updated taking a class!":"Error message; todo, implement varied error messages based on the return value: "+retval);
}

// 1c. Read takes - Just make it a select statement (user-specific)
// Options to include: 
//   user

async function readTakes (userid) {
    let toRet = [];
    const connection = await getNewConnection(false,true);

    let sql = 'select * from Takes where UserID = @userid';
    let request = new RequestM(sql, function (err, rowCount, rows) {
        if (err) {
            return generateMessage(false,err);
        }
    });

    request.addParameter('userid', types.Int, userid);

    connection.execSql(request);

    let rows2 = await execSqlRequestDonePromise (request);
    rows2.forEach((columns) => {
        let toPush = 
        convertFromTakeSchema(columns);
        toRet.push(toPush);
    });
    
    // Here's the magic: the then() function returns a new promise, different from the original:
        // So if we await that then we're good on everything in the thens
    return generateMessage(true,toRet);
}

// 3a. Update grade for specific take (user-specific)
// Why can't it they just be a SQL insert? Gotta be smart enough to just do nothing if already in or if the user has already taken this course; what if retake? this isn't used in gpa calc, but in the course calc

async function updateTake (userid,courseid,grade) {
// @userid INT,@courseid INT,@grade DECIMAL
    return await createTake(userid,courseid,grade);
}

// 2c. Delete takes (user-specific) - plain sql
// No need to validate, I think; delete won't violate foreign key by not doing anything
async function deleteTake(userid,courseid) {
    const connection = await getNewConnection(false,true);

    let sql = 'delete from Takes where userid = @userid AND courseid = @courseid';
    let request = new RequestM(sql, function (err, rowCount, rows) {
        if (err) {
            return generateMessage(false,err);
        }
    });

    request.addParameter('userid', types.Int, userid);
    request.addParameter('courseid', types.Int, courseid);

    connection.execSql(request);

    request.on('error', function (err) {
        return generateMessage(false,err);
    });
    let rows1 = await execSqlRequestDonePromise(request);
    
    return generateMessage(true,"Successfully deleted taking a course!");
}

//#endregion

//#region Classes
// 8. Get classes - this can be done with row sql and add a where with dept specification
//         Get department will be necessary too - also with sql
//         Options include: 
//           department
//           courseid
//           none
//         - Each will be sorted by coursedeptandnumber

async function readCourses (department,courseid) {
    let toRet = [];
    const connection = await getNewConnection(false,true);

    let sql = 'select * from Courses where 0=0';
    if (department) { sql += " and Dept=@department" }
    if (courseid) { sql += " and CourseID=@courseid" }

    let request = new RequestM(sql, function (err, rowCount, rows) {
        if (err) {
            return generateMessage(false,err);
        }
    });

    if (department) { request.addParameter('department', types.Int, department); }
    if (courseid) { request.addParameter('courseid', types.Int, courseid); }

    connection.execSql(request);

    let rows2 = await execSqlRequestDonePromise (request);
    rows2.forEach((columns) => {
        let toPush = 
        convertFromCourseSchema(columns);
        toRet.push(toPush);
    });
        
    return generateMessage(true,toRet);
}

// 10c. Validate courseid - this can just be a function wrapping plain sql (select count(*) from Courses where courseid=@courseid)
// - Makes sure given courseid is valid (called before anything that needs course id)

async function validateCourseID (courseid) {
    const connection = await getNewConnection(false,true);
    let sql = 'select COUNT(*) from Courses where CourseID=@courseid';
    let request = new RequestM(sql, function (err, rowCount, rows) {
        if (err) {
            return generateMessage(false,err);
        }
    });

    request.addParameter('courseid', types.Int, courseid); 
    connection.execSql(request);
    let rows1 = await execSqlRequestDonePromise (request);
    let numCourses = rows1[0][0].value; // first (and only) row, first (and only) column
    
    // Here's the magic: the then() function returns a new promise, different from the original:
        // So if we await that then we're good on everything in the thens
    return generateMessage(numCourses == 1,numCourses == 1?"Successfully validated course!":"Error message; todo, implement varied error messages based on the return value: ");
}

//#endregion

//#endregion

//#region (TODO) Averages
// 3b. Calculate average from users (from entered course data)
// - Live interactivity of this would be really sick
//   - Out of scope for now; would have to do some realy fancy shit (sacing avg every hour, algebraically keeping up with a little list of diffs in num and den to get new avgs x the # of averages we want like this)
// - Remind users to share their failures and successes; refactor the messaging to emphasize the benefit to everyone
//   - Something like "a community-driven, crowdsourced platform to help students make informed choice"
// - Needs to be a sproc because will need to get clean averages of each user (only the latest takes of each course by each user used in the average)
//   - Summer is last, not first; link academic calendar on site front page too to advertise for future planning
//   - We need a view of courses with only the coursedeptandname and the age (calculated from year and quarter; honestly could be as simple as sum of quarter as tenths digit and year kept the same [e.g. 2022.3 hey this actually kind of like reality lol, I could make the decimals all realistically for each quarter]) and courseid - these will give use the info we need for the join with takes
//     - This will give us the grades of all of the latest courses, after we filter the view above to those with the highest age within each coursedeptandname

// - Strategy will be to do a similar style filter as 3c with appendings; then this table is inserted into
//   - If this succeeds, then we run the sproc with output param 2.7
//     Options to include (filtering the users):
//       user (user-specific)
//       user year (standing)
//       major
//       double majors (all, not specific)
//       triple major (all, not specific)
//       nothing for all for all
// 3c. Calculate average from courses (based on all course fields; and their interserctions)
//     - We can just use where statements appended to the query currently saved, run as a sqlsstatements
//     IMPORTANTE - For all THE AVERAGES, HAVEV 10 be thee threshold of dhowing data (loading bar displayed of have far untiol we reach necessary data)
//     coursedeptandnumber
//     class year
//     quarter
//     professor
//     nothing for all for all
// 3d. Calculate averages from stated gpa
//     - Maybe give the user a little message if they match (like, congrats!)
//     - And like a gamified load bar on their profile of what % of their data has been entered by them
//     Options to include (filtering the users): - can just be a sql query with the following stuff appended in the where
//       - For appended to where conditions start with an always true (0 = 0) and then the ands appended
//       user (user-specific)
//       user year (standing)
//       major
//       double majors (all, not specific)
//       triple major (all, not specific)
//       nothing for all for all

//#endregion

//#region (TODO) Get Search Data
// 4. Search for class (https://www.algolia.com/blog/engineering/how-to-implement-autocomplete-with-javascript-on-your-website/)
// Options - use sql for all of these, no need for anything else
//   By description/nsame - Autocomplete names/substring search
//   By course name and dept (e.g., CSSE220) - Autocomplete names/substring search
//   By professor - Autocomplete names/substring search
// Two choices: 
//   Use a sproc and filter on the backend with an index on the name like 333 group (a /suggest endpoint)
//   - I think this is the way to go; the algolia implementation was very simple. I just need to preload the three arays above all the endpoints and just call on them for filtering
//   Use pagination for search results
// Add endpoints for getting all of these as an arrays
// - Ooh one of the could return all the professors names but with first name first, other with last name first
// - Then the autocomplete results are given

//#endregion

//#region Authentication

// TODO
    // Call right after login, otherwise redirect
async function isValidated(userid) {
    const connection = await getNewConnection(false,true);

    let sql = 'select IsValidated from Users where userid = @userid';
    let request = new RequestM(sql, function (err, rowCount, rows) {
        if (err) {
            return generateMessage(false,err);
        }
    });

    request.addParameter('userid', types.Int, userid);

    connection.execSql(request);

    request.on('error', function (err) {
        return generateMessage(false,err);
    });
    let rows1 = await execSqlRequestDonePromise(request);
    
    return generateMessage((rows1.length==1 && !(!rows1[0][0].value)),(rows1.length==1 && !(!rows1[0][0].value))?"Successfully validated user!":"Didn't return 1 user");
}

// 2a. Verify the code was was correct - sproc that return success and removes
// - Delete verification code
// - Make a signups table - use have a limit on the number of users, delete from it if it's success

async function validateUser(userid,validationcode) {
    let connection = await getNewConnection(false,false);

    const request = new RequestM('validateUser', (err, rowCount) => {
        if (err) { 
            return generateMessage(false,err);
        }
        connection.close();
    });

    // @userid INT,@validationcode
    request.addParameter('userid', types.Int, userid);
    request.addParameter('validationcode', types.Char, validationcode);

    // In SQL Server 2000 you may need: connection.execSqlBatch(request);
    connection.callProcedure(request);
 
    request.on('error', function (err) {
        return generateMessage(false,err);
    });

    let retval = await callProcedureRequestFinalReturnPromise (request);
    return generateMessage(retval==0,retval==0?"Successfully validated user!":"Error message; todo, implement varied error messages based on the return value: "+retval);
}

// 10a. Login endpoint - sql
    // TODO Use salting on the table's and AddParameters' values
async function login(username, email, password) {
    if (!username && !email) {
        return generateMessage(false,"Enter username or email");
    }

    const connection = await getNewConnection(false,true);
    let sql = 'select UserID from Users where password=@password';

    if (username) { sql += " and Username=@username" }
    if (email) { sql += " and Email=@email" }

    let request = new RequestM(sql, function (err, rowCount, rows) {
        if (err) {
            return generateMessage(false,err);
        }
    });

    request.addParameter('password', types.VarChar, password);
    if (username) { request.addParameter('username', types.VarChar, username); }
    if (email) { request.addParameter('email', types.VarChar, email); }


        connection.execSql(request);

    request.on('error', function (err) {
        return generateMessage(false,err);
    });
    let rows1 = await execSqlRequestDonePromise(request);
    let numUsers = rows1.length; // first (and only) row, first (and only) column
    return generateMessage(numUsers==1,numUsers==1?rows1[0][0].value:"Incorrect username or password.");
}

// 10b. Log out - no need for a function just set userid to null in session

//#endregion

//#region Connectivity
// Has both done and doneProc to cover all of the bases
const execSqlRequestDonePromise = (request) => {
    return new Promise((resolve, reject) => {
        // This literally does it for subparts of the sproc (which could obvi lead to weird stuff if intermediate steps (table valued variables) 
            // are returned during a complex procedure)
            // But this should be fine so long as it's used for execSql requests and not callProcedure or something
        request.on('doneInProc',function (rowCount, more, rows) {
            // console.log('Jared Dunn (In Proc)!');
            resolve(rows);
        });
        request.on('done',function (rowCount, more, rows) {
            // console.log('Jared Dunn (NOT Proc)!');
            resolve(rows);
        });
        request.on('doneProc',function (rowCount, more, rows) {
            // console.log('Jared Dunn (Proc)!');
            resolve(rows);
        });
    });
}

const callProcedureRequestOutputParamPromise = (request) => {
    return new Promise((resolve, reject) => {
        // This literally does it for subparts of the sproc (which could obvi lead to weird stuff if intermediate steps (table valued variables) 
            // are returned during a complex procedure)
            // But this should be fine so long as it's used for execSql requests and not callProcedure or something
        request.on('returnValue', function(parameterName, value, metadata) {
            console.log('Output Param!');
            resolve(value);
        });
    });
}

const callProcedureRequestFinalReturnPromise = (request) => {
    return new Promise((resolve, reject) => {
        // This literally does it for subparts of the sproc (which could obvi lead to weird stuff if intermediate steps (table valued variables) 
            // are returned during a complex procedure)
            // But this should be fine so long as it's used for execSql requests and not callProcedure or something
        request.on('doneProc', function (rowCount, more, returnStatus, rows) {
            console.log('SPROC Return!');
            resolve(returnStatus);
        });
    });
}

async function getNewConnection(rowCollectionOnRequestCompletion,rowCollectionOnDone) {
    var config = JSON.parse(fs.readFileSync("connectivity_config.json"));
    config.options.rowCollectionOnRequestCompletion = rowCollectionOnRequestCompletion;
    config.options.rowCollectionOnDone = rowCollectionOnDone;
    let toRet = new ConnectionM(config);
    let prom = connectPromise(toRet);
    await prom;
    return toRet;
}

const connectPromise = (connection) => {
    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                console.log('Connection Failed');
                resolve(err);
            }
            console.log("Connection Succeeded!");
            resolve("Connection Succeeded!");
        });
    });
}
//#endregion

//#region Helper Functions

function generateMessage(success, message) {
    return {success:success,message:message,statuscode:200};
}

function checkValidMajors(majorsstr) {
    let majors = majorsstr.split(";");
    for (let i = 0; i < majors.length; i++) {
        if (!checkValidMajor(majors[i])) {
            return false;
        }
    }
    return true;
}

function checkValidMajor(major) {
    let majors = JSON.parse(fs.readFileSync("data/majorinfo.json")).majors;
    return majors.includes(major);
}

function booleanToBit(bool) {
    return bool?1:0;
}

const waitSeconds = (n) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("5 seconds passed");
            resolve("Finished waiting!");
        }, n*1000);
    });
}
//#region Random Code Generation
function generateTemporaryCode() {
    return getRandomInt(10).toString()+getRandomInt(10).toString()+
    getRandomInt(10).toString()+getRandomInt(10).toString();
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}
//#endregion
//#endregion

//#region Schema Conversions

function convertFromCourseSchema(row) {
    let courseid = 0;
    let name = "";
    let dept = "";
    let credits = 0;
    let professor = "";
    let year = "";
    let quarter = "";
    let coursedeptandnumber = "";

    row.forEach((column) => {
            let colName = column.metadata.colName;
            switch (colName) {
                case 'CourseID':
                    courseid = column.value;
                    break;
                case 'Name':
                    name = column.value;
                    break;
                case 'Dept':
                    dept = column.value;
                    break;
                case 'Credits':
                    credits = column.value;
                    break;
                case 'Professor':
                    professor = column.value;
                    break;
                case 'Year':
                    year = column.value.slice(-5);
                    break;
                case 'Quarter':
                    quarter = column.value;
                    break;
                case 'CourseDeptAndNumber':
                    coursedeptandnumber = column.value;
                    break;
                default:
                  console.log(`New column name?!: ${colName}`);
              }
        });
    return {courseid:courseid,name:name,dept:dept,credits:credits,professor:professor,year:year,quarter:quarter,coursedeptandnumber:coursedeptandnumber};
}

function convertFromUserSchema(row) {
    let email = "";
    let username = "";
    let standing = "";
    let gpa = 0;

    row.forEach((column) => {
            let colName = column.metadata.colName;
            switch (colName) {
                case 'Email':
                    email = column.value;
                    break;
                case 'Username':
                    username = column.value;
                    break;
                case 'Standing':
                    standing = column.value;
                    break;
                case 'GPA':
                    gpa = column.value;
                    break;
                default:
                  console.log(`New column name?!: ${colName}`);
              }
        });
            // the front end should also recoil in horror, separately
                // There should be a strikethrough /graying out of any non-veg in reqs or general list
    return {email:email,username:username,standing:standing,gpa:gpa};
}

function convertFromTakeSchema(row) {
    let userid = 0;
    let courseid = 0;
    let grade = 0;

    row.forEach((column) => {
            let colName = column.metadata.colName;
            switch (colName) {
                case 'UserID':
                    userid = column.value;
                    break;
                case 'CourseID':
                    courseid = column.value;
                    break;
                case 'Grade':
                    grade = column.value;
                    break;
                default:
                  console.log(`New column name?!: ${colName}`);
              }
        });
            // the front end should also recoil in horror, separately
                // There should be a strikethrough /graying out of any non-veg in reqs or general list
    return {userid:userid,grade:grade,course:convertFromCourseSchema(row)};
}
//#endregion

exports.createUser = createUser;
exports.readUser = readUser;
exports.updateUser = updateUser;
exports.updatePassword = updatePassword;

exports.createTake = createTake;
exports.readTakes = readTakes;
exports.updateTake = updateTake;
exports.deleteTake = deleteTake;

exports.readCourses = readCourses;
exports.validateCourseID = validateCourseID;

exports.isValidated = isValidated;
exports.validateUser = validateUser;
exports.login = login;

exports.generateTemporaryCode = generateTemporaryCode;