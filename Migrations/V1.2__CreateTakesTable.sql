CREATE TABLE Takes (
  TakeID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  FOREIGN KEY (UserID) References Users(UserID),
  Grade varchar(2) NULL,
  Professor VARCHAR(50) NOT NULL,
  CourseID INT NOT NULL,
  FOREIGN KEY (CourseID) References Courses(CourseID),
  CONSTRAINT UC_UserCourse UNIQUE (UserID,CourseID),
PRIMARY KEY(TakeID)
)