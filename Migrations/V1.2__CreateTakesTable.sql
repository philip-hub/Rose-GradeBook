--Takes(ID, User, Grade, Professor, Course)

CREATE TABLE Takes (
  TakeID INT NOT NULL IDENTITY PRIMARY KEY,
  UserID INT NOT NULL FOREIGN KEY References Users(UserID),
  Grade varchar(2) NULL, -- Only populate if the grade is something we can calculate the avg with
  Professor VARCHAR(50) NOT NULL,
  CourseID INT NOT NULL FOREIGN KEY References Courses(CourseID),
  CONSTRAINT UC_UserCourse UNIQUE (UserID,CourseID)
  -- Constraint so we can say; please enter one grade per course
)