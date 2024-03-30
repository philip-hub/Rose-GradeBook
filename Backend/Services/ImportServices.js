var ConnectionM = require('tedious').Connection;
var RequestM = require('tedious').Request;
var types = require('tedious').TYPES;
const fs = require("fs");
const { DateTime } = require("luxon");

// Gets formatted date
function formattedDate (daysAgo) {
    let val = DateTime.now().minus({ days: daysAgo });
    let toRet = val.year+"-"+val.month.toString().padStart(2,'0')+"-"+val.day.toString().padStart(2,'0');
    return toRet;
}
function newYearDate (year) {
  return year+"-06-06";
}

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
          toRet.push(
              {
                  Name:courses_course.substring(0,100), // it's a name
                  Dept:dept.substring(0,10),
                  Credits:sections.sections[quarter][cname]["credit_hours"],
                  Professor:sections.sections[quarter][cname]["professor"],
                  Number:cnum,
                  Year:newYearDate(year),
                  Quarter:quarter,
                  CourseDeptAndNumber:dept.substring(0,10)+cnum
              }
          );
            }
      }
    }
  }
  return toRet;
}

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

exports.writeCourses = writeCourses;