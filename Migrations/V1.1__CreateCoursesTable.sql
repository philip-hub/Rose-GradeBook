CREATE TABLE Courses (
  CourseID INT NOT NULL AUTO_INCREMENT,
  `Name` VARCHAR(100) NOT NULL,
  Dept VARCHAR(10) NOT NULL,
  Credits FLOAT(24) NULL,
  `Number` VARCHAR(10) NOT NULL,
  `Year` DATE NOT NULL,
  `Quarter` VARCHAR(10) NOT NULL,
  CONSTRAINT UC_Course UNIQUE (`Number`,Dept,`Year`,`Quarter`),
  CONSTRAINT Valid_Quarter CHECK( `Quarter` in ('Fall','Winter','Spring','Summer')),
 PRIMARY KEY(CourseID)
)