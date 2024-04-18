var ConnectionM = require('tedious').Connection;
var RequestM = require('tedious').Request;
var types = require('tedious').TYPES;
const fs = require("fs");
const { DateTime } = require("luxon");

//#region Courses
async function writeCourses (courses, sections, year) {
  const connection = await getNewConnection(true,true);
  let numRows = await bulkLoadCourses(courses, sections, year, connection); // it's okay if we don't await this because for inserts we just gotta run this in the background
                                                      // Also bulkload doesn't have any events
  connection.on('error', async function (err) {
    // bulk load failed
    if (err) {
      console.log("Er: "+err);
        throw err;
    }
});
return numRows;
}

const bulkLoadCourses = (courses, sections, year, connection) => {
  return new Promise((resolve, reject) => {

  const options = { keepNulls: true };
  // instantiate - provide the table where you'll be inserting to, options and a callback
  const bulkLoad = connection.newBulkLoad('Courses', options, function (error, rowCount) {
      console.log("error: "+error);
      console.log('inserted %d rows', rowCount);
      if (error) {
        throw error;
      }
      resolve(rowCount);
  });
  console.log("Starting Bulkload");
  // setup your columns - always indicate whether the column is nullable
  bulkLoad.addColumn('Name', types.VarChar, { length:100, nullable: false });
  bulkLoad.addColumn('Dept', types.VarChar, { length:10, nullable: false });
  bulkLoad.addColumn('Credits', types.Float, { nullable: true,precision:24 });
  bulkLoad.addColumn('Professor', types.VarChar, { length:100, nullable: true }); // okay, so this isn't normalized, but I don't care
  bulkLoad.addColumn('Number', types.VarChar, { length:10, nullable: false });
  bulkLoad.addColumn('Year', types.Date, { nullable: false });
  bulkLoad.addColumn('Quarter', types.VarChar, { length:10,nullable: false });
  bulkLoad.addColumn('CourseDeptAndNumber', types.VarChar, { length:20, nullable: true }); // only not calculated or efficiency tings
  bulkLoad.addColumn('Section', types.VarChar, { length:5, nullable: true }); // only not calculated or efficiency tings

  // execute
  connection.execBulkLoad(bulkLoad, convertToCourseSchema(courses, sections, year));
});

}

function convertToCourseSchema(courses, sections, year) {
  // change to checking <1 and null explicitly separately
  // TODO, use this, seems like my exact use case: https://tediousjs.github.io/tedious/bulk-load.html
  console.log("Got here");
  let toRet = [];
  for (let qid in Object.keys(sections.sections)) {
    // for sections
    let quarter = Object.keys(sections.sections)[qid];
    let sections_quarter = sections.sections[quarter];
    for (let did in Object.keys(courses)) {
        let dept = Object.keys(courses)[did];
        let courses_dept = courses[dept];
        for (let cid in Object.keys(courses_dept)) {
          let cnum = Object.keys(courses_dept)[cid];
          let courses_course = courses_dept[cnum]; // unused cuz sections better
          let cname = dept+cnum;
          // console.log("Course: "+cname);

          if (sections_quarter.hasOwnProperty(cname) // && toRet.length < 5
          ) {
            // console.log(sections.sections[quarter][cname]["credit_hours"]);
            let sections_cname = sections.sections[quarter][cname];
            for (let i = 0; i < sections_cname.length; i++) {
              toRet.push(
                section_factory(
                  courses_course.substring(0,100),dept.substring(0,10),
                  sections_cname[i]["credit_hours"],
                  sections_cname[i]["professor"], 
                  cnum, 
                  midYearDate(year),
                  quarter,
                  dept.substring(0,10)+cnum,sections_cname[i]["section"]
                  )
              );
            }
          }
      }
    }
  }
  return toRet;
}
//#endregion

//#region Comments
/** toddoy */
// This is the most difficult method in the whole process
async function writeComments(reviews) { 

  // REFACTOR THIS SHIZZLE TO GET SECTION IDA ALL AT ONCE USING TVPs WITH THE REVIEWS, A SPROC, AND THEN READING FROM A TABLE AFTERWARDS
  // Iterate through each review and convert it

// Get section ids for all reviews (use a subquery in the columns that will go row by row and calculate the new value for the section id in the SELECT https://www.red-gate.com/simple-talk/databases/sql-server/t-sql-programming-sql-server/using-a-subquery-in-a-select-statement/)
  // Go through any null ones and make dummy sections for them per the algorithm below
// Creates takes and comments to load by looping through these, and creating a section if need be, followed by the take, and finally the comment
   // It's important to also make sure that takes that use the same sectionid and a null userid are not hit with uniqueness issues
// Return all three arrays in an object
let sections = [];
let takes = [];
let reviewsData = [];

  for (let i =  0; i < reviews.length; i++) {
    let review = reviews[i];
    let quarterYear = getQuarterAndYear(review);
    reviewsData.push([review.profLastName.trim()+", "+review.profFirstName.trim(),quarterYear.year,quarterYear.quarter, review.course.toUpperCase()]);
    /**
      Professor: course: without the parentheses on/Review: the names we have, minus a space at the end of the first name
      Year: course/review two months before
      Quarter: course/review also two months before use datetime manip via luxon in a function
      CourseDeptAndNumber: course/the review's should start with this one */
  }
  console.log("Got here");
  let sectionIDs = await getSectionIDs(reviewsData);
  for (let i = 0; i < reviews.length; i++) {
    let sectionID = sectionIDs[i];
    if (!sectionID) {
      let created = {};
      try {
        created = await reviewToNewSection(reviews[i]);
      } catch (err) {
        console.log("Error"+err);
        console.log("course: "+reviews[i].course);
      }
      sections.push(created);
    }
  }

  const connection = await getNewConnection(true,true);
  await bulkLoadSections(sections, connection);

  connection.on('error', async function (err) {
    // bulk load failed
    if (err) {
      console.log("Er: "+err);
        throw err;
    }
  });

  sectionIDs = await getSectionIDs(reviewsData);
  for (let i = 0; i < reviews.length; i++) {
    let sectionID = sectionIDs[i];
    if (!sectionID) {
      throw "Still null section id, that's bad";
    }
    takes.push(
        {
            UserID:null, // it's a name
            CourseID:sectionID,
            Grade: letterGradeToNum(reviews[i].Grade)
        }
    );
  }
  const connection2 = await getNewConnection(true,true);
  let numRows = await bulkLoadTakes(takes, connection2);
  connection2.on('error', async function (err) {
    // bulk load failed
    if (err) {
      console.log("Er: "+err);
        throw err;
    }
  });

  let takeIDs = await getNRecentTakeIDs(numRows);
  for (let i = 0; i < reviews.length; i++) {
    let takeID = takeIDs[i];
    comments.push(
      {
          Likes:reviews[i].likes-reviews[i].dislikes, // it's a name
          TakeID:takeID,
          CommentDate: reviews[i].dates,
          Comment: getComment(reviews[i])
      }
    );
  }
  const connection3 = await getNewConnection(true,true);
  let numComments = await bulkLoadComments(comments, connection3);
  connection3.on('error', async function (err) {
    // bulk load failed
    if (err) {
      console.log("Er: "+err);
        throw err;
    }
  });

  console.log(numComments+" comments added!");

  return numComments;
}
const bulkLoadSections = (toLoad, connection) => {
  return new Promise((resolve, reject) => {

  const options = { keepNulls: true };
  // instantiate - provide the table where you'll be inserting to, options and a callback
  const bulkLoad = connection.newBulkLoad('Courses', options, function (error, rowCount) {
      console.log("error: "+error);
      console.log('inserted %d rows', rowCount);
      if (error) {
        throw error;
      }
      resolve(rowCount);
  });
  console.log("Starting Bulkload");
  // setup your columns - always indicate whether the column is nullable
  bulkLoad.addColumn('Name', types.VarChar, { length:100, nullable: false });
  bulkLoad.addColumn('Dept', types.VarChar, { length:10, nullable: false });
  bulkLoad.addColumn('Credits', types.Float, { nullable: true,precision:24 });
  bulkLoad.addColumn('Professor', types.VarChar, { length:100, nullable: true }); // okay, so this isn't normalized, but I don't care
  bulkLoad.addColumn('Number', types.VarChar, { length:10, nullable: false });
  bulkLoad.addColumn('Year', types.Date, { nullable: false });
  bulkLoad.addColumn('Quarter', types.VarChar, { length:10,nullable: false });
  bulkLoad.addColumn('CourseDeptAndNumber', types.VarChar, { length:20, nullable: true }); // only not calculated or efficiency tings
  bulkLoad.addColumn('Section', types.VarChar, { length:5, nullable: true }); // only not calculated or efficiency tings

  // execute
  connection.execBulkLoad(bulkLoad, toLoad);
});

}
const bulkLoadTakes = (toLoad, connection) => {
  return new Promise((resolve, reject) => {

  const options = { keepNulls: true };
  // instantiate - provide the table where you'll be inserting to, options and a callback
  const bulkLoad = connection.newBulkLoad('Takes', options, function (error, rowCount) {
      console.log("error: "+error); 
      console.log('inserted %d rows', rowCount);
      if (error) {
        throw error;
      }
      resolve(rowCount);
  });
  console.log("Starting Bulkload");

  // setup your columns - always indicate whether the column is nullable
  bulkLoad.addColumn('UserID', types.Int, { nullable: false });
  bulkLoad.addColumn('CourseID', types.Int, { nullable: true });
  bulkLoad.addColumn('Grade', types.Float, { nullable: true,precision:53 });

  // execute
  connection.execBulkLoad(bulkLoad, toLoad);
});

}
const bulkLoadComments = (toLoad, connection) => {
  return new Promise((resolve, reject) => {

  const options = { keepNulls: true };
  // instantiate - provide the table where you'll be inserting to, options and a callback
  const bulkLoad = connection.newBulkLoad('CourseComments', options, function (error, rowCount) {
      console.log("error: "+error); 
      console.log('inserted %d rows', rowCount);
      if (error) {
        throw error;
      }
      resolve(rowCount);
  });
  console.log("Starting Bulkload");

  // setup your columns - always indicate whether the column is nullable
  bulkLoad.addColumn('Likes', types.Int, { nullable: false });
  bulkLoad.addColumn('TakeID', types.Int, { nullable: false });
  bulkLoad.addColumn('CommentDate', types.Date, { nullable: false });
  bulkLoad.addColumn('Comment', types.VarChar, { length:1000, nullable: true }); // only not calculated or efficiency tings

  // execute
  connection.execBulkLoad(bulkLoad, toLoad);
});

}
/** toddoy */
/**
 * Review Schema: (Quality, Difficulty, For Credit, Attendance, Would Take Again), 
                  (Grade), (Textbook, SourceLink, Tags), (Likes, Dislikes), (Date), (Course), 
                  (Prof Name)
 * Goal Schema: @likes INT,@takeid INT,@commentdate DATE,@comment varchar(1000) <- CourseComments
                  and @userid INT,@courseid INT,@grade float <- Takes
    @likes INT
      Likes-Dislikes
    @takeid INT
      Will be inserted
        @userid INT
          NULL, for now; idk how it should affect averages
          // we can run updates for these takes later to give userid unique by dept, maybe using partition
        @courseid INT
          // will require a call to the match method using the review
        @grade float
          Grade
    @commentdate DATE
      Date
    @comment varchar(1000)
      Quality, Difficulty, For Credit, Attendance, Would Take Again
      Textbook, SourceLink, Tags
      
 */
// Creates or gets section id from the available review data
/** toddoy */
/**
  Use first other section that matches
    Professor: (TODO, MODIFY ALL PROFS IMPORTED TO NOT HAVE NAME INCLUDE USERNAME)
      Must like try and see if tsql supports the like command "[last], [first]" 
    Year: 
      Use a converter(subtract like a month and then put in buckets based on academic calendar)
    Quarter: 
      Same converter should return year and quarter
    CourseDeptAndNumber: 
      Must match (maybe in the future we make it smart enough to get old aliases)
    Section: RMP
    Insert a new section if you can’t find one
    Find a course wityh samme coursenamendnumber (not dept, that is given by course)
    If there isn’t one, them ignore the course and write its name to a text file so I can log it
      create a course with this name
        Name: coursedeptandnumber
        Dept: must be an existing - derived from coursedeptandnumber prefix
        Credits: 4
        Professor: Review
        Number: review
        Year: Review
        Quarter: review
        CourseDeptAndNumber: review
        Section: RMP
    If there is one
      Name: course
      Dept: course
      Credits: course
      Professor: course: without the parentheses on/Review: the names we have, minus a space at the end of the first name
      Number: course
      Year: course/review
      Quarter: course/review
      CourseDeptAndNumber: course/the review's should start with this one
      Section: RMP
    Log any failures
 */
// returns a parallel array of section ids to the reviewData, null if there isn't a corresponding section
async function getSectionIDs(reviewsData) {  
  let table = {
    columns: [
      {name: 'Pf', type: types.VarChar, length: 100},
      {name: 'Yr', type: types.Date},
      {name: 'Qr', type: types.VarChar, length: 10},
      {name: 'Cr', type: types.VarChar, length: 20}
    ],
    rows: 
    // [
    //   [15, 'Eric', true],
    //   [16, 'John', false]
    // ]
    reviewsData
  };

  let connection = await getNewConnection(false,true); // same as a sql run, need that table data

  const request = new RequestM('getSectionIDs', (err, rowCount) => {
    if (err) {
      console.log('Statement failed: ' + err);
      callback = err;
    } else {
      console.log('No errors in TVP')
      callback = 'Success';
    }
      connection.close();
  });

  request.addParameter('review_data', types.TVP, table);

  connection.callProcedure(request);
  let toRet = [];
  let rows2 = await tableReturnRequestDonePromise (request);
  rows2.forEach((row) => {
      let sectionid = 
      convertFromGetSectionIDsSchema(row);
      toRet.push(sectionid);
  });

  return toRet;
}
// See comment above getSectionID
async function reviewToNewSection(review) {
  let dept = await matchDept(review.course);
  let quarterYear = getQuarterAndYear(review);
  let number = review.course.substring(dept.length).toUpperCase();
  let coursedeptandnumber = review.course.substring(0, dept.length).toUpperCase();
  let professor = review.profLastName.trim()+", "+review.profFirstName.trim();
  if (number.length > 10) {
    number = number.substring(0,10);
  }
  if (coursedeptandnumber.length > 20) {
    coursedeptandnumber = coursedeptandnumber.substring(20);
  }
  if (professor > 100) {
    professor = professor.substring(100);
  }
  return section_factory(
    coursedeptandnumber,
    dept,
    4,
    professor,
    number, 
    quarterYear.year,
    quarterYear.quarter,
    coursedeptandnumber,
    "RMP"
    );
}

function convertFromGetSectionIDsSchema(row) {
  let sectionid = 0;

  row.forEach((column) => {
          let colName = column.metadata.colName;
          switch (colName) {
              case 'SectionID':
                  sectionid = column.value;
                  break;
              default:
                console.log(`New column name?!: ${colName}`);
            }
      });
          // the front end should also recoil in horror, separately
              // There should be a strikethrough /graying out of any non-veg in reqs or general list
  return sectionid;
}
//#endregion

//#region Helpers
// Gets formatted date
function formattedDate (daysAgo) {
  let val = DateTime.now().minus({ days: daysAgo });
  let toRet = val.year+"-"+val.month.toString().padStart(2,'0')+"-"+val.day.toString().padStart(2,'0');
  return toRet;
}
function midYearDate (year) {
return year+"-06-06";
}
function getQuarterAndYear(review) {
  let date = review.dates;
  let takeDate = DateTime.fromFormat(date, 'yyyy-MM-dd').minus({weeks: 2});
  let month = takeDate.month;
  let day = takeDate.day;
  let year = takeDate.year;
  let quarter = "";
  // Order of these if elses matter, conditions made with this order in mind
  if ((month == 8 && day <= 20) || month > 8 && month < 11 || (month == 11 && day < 28)) {
    quarter = "Fall";
    year++;
  } else if (month < 3 || (month == 3 && day < 7) || month > 10) {
    quarter = "Winter";
    if (month > 10) {
      year++;
    }
  } else if (month > 2 && month < 6) {
    quarter = "Spring"
  } else {
    quarter = "Summer";
  }
  return {quarter:quarter,year:midYearDate(year)};
}

function letterGradeToNum(letterGrade) {
  letterGrade = letterGrade.toUpperCase();
  switch (letterGrade) {
    case "A+":
      return 4.0;
    case 'A':
      return 4.0;
    case 'B+':
      return 3.5;
    case 'B':
      return 3.0;
    case 'C+':
      return 2.5;
    case 'C':
      return 2.0;
    case 'D+':
      return 1.5;
    case 'D':
      return 1.0;
    case 'F':
      return 0;
    default:
      return null;
  }
}

function section_factory(name,dept,credits,professor,number,year,quarter,coursedeptandnumber,section){
  return {
    Name:name,
    Dept:dept,
    Credits:credits,
    Professor:professor,
    Number:number,
    Year:year,
    Quarter:quarter,
    CourseDeptAndNumber:coursedeptandnumber,
    Section:section
  };
}
async function matchDept(course) {
  course = course.toUpperCase();
  let depts = JSON.parse(await fs.promises.readFile("data/departmentinfo.json")).departments;
  for (let  i = 0; i<depts.length;i++) {
    if (course.startsWith(depts[i])) {
      return depts[i];
    }
  }
  throw "No matching dept";
}
//#endregion

//#region Connectivity
async function getNewConnection(rowCollectionOnRequestCompletion,rowCollectionOnDone) {
  var config = JSON.parse(fs.readFileSync("./connectivity_config.json"));
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

const tableReturnRequestDonePromise = (request) => {
  return new Promise((resolve, reject) => {
      // This literally does it for subparts of the sproc (which could obvi lead to weird stuff if intermediate steps (table valued variables) 
          // are returned during a complex procedure)
          // But this should be fine so long as it's used for execSql requests and not callProcedure or something
      request.on('doneInProc',function (rowCount, more, rows) {
          console.log('Jared Dunn (In Proc)!');
          console.log("useful: "+rowCount);
          resolve(rows);
      });
      request.on('done',function (rowCount, more, rows) {
          console.log('Jared Dunn (NOT Proc)!');
          console.log("useful: "+rowCount);
          resolve(rows);
      });
      request.on('doneProc',function (rowCount, more, rows) {
          console.log('Jared Dunn (Proc)!');
          console.log("useful: "+rowCount);
          resolve(rows);
      });
  });
}
//#endregion

exports.writeCourses = writeCourses;
exports.writeComments = writeComments;