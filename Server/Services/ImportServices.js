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
                  {
                      Name:courses_course.substring(0,100), // it's a name
                      Dept:dept.substring(0,10),
                      Credits:sections_cname[i]["credit_hours"],
                      Professor:sections_cname[i]["professor"],
                      Number:cnum,
                      Year:newYearDate(year),
                      Quarter:quarter,
                      CourseDeptAndNumber:dept.substring(0,10)+cnum,
                      Section:sections_cname[i]["section"]
                  }
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
async function convertReviewsToTakesCommentsAndSections(reviews) { 

  // REFACTOR THIS SHIZZLE TO GET SECTION IDA ALL AT ONCE USING TVPs WITH THE REVIEWS, A SPROC, AND THEN READING FROM A TABLE AFTERWARDS
  // Iterate through each review and convert it

// Get section ids for all reviews (use a subquery in the columns that will go row by row and calculate the new value for the section id in the SELECT https://www.red-gate.com/simple-talk/databases/sql-server/t-sql-programming-sql-server/using-a-subquery-in-a-select-statement/)
  // Go through any null ones and make dummy sections for them per the algorithm below
// Creates takes and comments to load by looping through these, and creating a section if need be, followed by the take, and finally the comment
   // It's important to also make sure that takes that use the same sectionid and a null userid are not hit with uniqueness issues
// Return all three arrays in an object

  let reviewsData = [];
  for (let i = 0; i < reviews.length; i++) {
    reviewsData.push(reviews[i]);
  }
  console.log("Got here");
  let sectionIDs = await getSectionIDs(reviewsData);
  let takes = [];
  for (let i = 0; i < reviews.length; i++) {
    let sectionID = sectionIDs[i];
    if (!sectionID) {
// generate
    }
    takes.push(
        {
            UserID:null, // it's a name
            CourseID:sectionID,
            Grade: letterGradeToNum
        }
    );
  }

  return toRet;
  return reviewsData;
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
    Section: RMP01
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
      Section: RMP01
  Insert a new section if you can’t find one
    Find a course wityh samme coursenamendnumber (not dept, that is given by course)
      If there isn't one, then ignore the course and write it’s name to a text file so I can log it    
      If there is one
      Name: course
      Dept: course
      Credits: course
      Professor: course: without the parentheses on/Review: the names we have, minus a space at the end of the first name
      Number: course
      Year: course/review
      Quarter: course/review
      CourseDeptAndNumber: course/the review's should start with this one
      Section: RMP01
    Log any failures
 */
// returns false if there isn't a section like it
async function getSectionIDs(reviews) {
// 
}
// See comment above getSectionID
async function makeSection(review) {
  // 
}
/** toddoy */
// Pretty straightforward, clone of old functionality
function writeComments(comments) {

}
//#endregion

//#region Helpers
// Gets formatted date
function formattedDate (daysAgo) {
  let val = DateTime.now().minus({ days: daysAgo });
  let toRet = val.year+"-"+val.month.toString().padStart(2,'0')+"-"+val.day.toString().padStart(2,'0');
  return toRet;
}
function newYearDate (year) {
return year+"-06-06";
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
//#endregion

exports.writeCourses = writeCourses;
exports.convertReviewsToTakesCommentsAndSections = convertReviewsToTakesCommentsAndSections;
exports.writeComments = writeComments;