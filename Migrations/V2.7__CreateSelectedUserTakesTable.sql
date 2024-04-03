--  c.CourseID, c.CourseDeptAndNumber, t.Grade, c.Credits, "Time"
        --   user (user-specific)
        --   user year (standing)
        --   major
        --   double majors (all, not specific)
        --   triple major (all, not specific)
        --   nothing for all for all

CREATE TABLE SelectedUserTakes (
  SelectedUserTakeID INT NOT NULL IDENTITY PRIMARY KEY,
  CourseID INT,
  CourseDeptAndNumber VARCHAR(20), 
  Grade FLOAT,
  Credits FLOAT,
  UserID INT,
  TakeUserID INT,
  [Time] FLOAT
)