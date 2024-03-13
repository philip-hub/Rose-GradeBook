var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var types = require('tedious').TYPES;
const fs = require("fs");
const { DateTime } = require("luxon");

// Gets formatted date
function formattedDate (daysAgo) {
    let val = DateTime.now().minus({ days: daysAgo });
    let toRet = val.year+"-"+val.month.toString().padStart(2,'0')+"-"+val.day.toString().padStart(2,'0');
    return toRet;
}

async function writeCourses (daysAgo,mealstr,foods) {
  const connection = await getNewConnection(false,false);
  bulkLoadCourses(foods, connection); // it's okay if we don't await this because for inserts we just gotta run this in the background
                                                      // Also bulkload doesn't have any events
  connection.on('error', async function (err) {
      // bulk load failed
      if (err) {
          throw err;
      }
  });
  
  return true;
}

exports.writeCourses = writeCourses;