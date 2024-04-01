--  c.CourseID, c.CourseDeptAndNumber, t.Grade, c.Credits, "Time"
        --   user (user-specific)
        --   user year (standing)
        --   major
        --   double majors (all, not specific)
        --   triple major (all, not specific)
        --   nothing for all for all

CREATE TABLE SelectedUserTakes (
  SelectedUserAgeID INT NOT NULL IDENTITY PRIMARY KEY,
  CourseDeptAndNumber VARCHAR(20), 
  Grade FLOAT,
  Credits FLOAT,
  UserID INT,
  [Time] FLOAT
)