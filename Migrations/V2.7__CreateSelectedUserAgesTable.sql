--  c.CourseID, c.CourseDeptAndNumber, t.Grade, c.Credits, "Time"
        --   user (user-specific)
        --   user year (standing)
        --   major
        --   double majors (all, not specific)
        --   triple major (all, not specific)
        --   nothing for all for all

CREATE TABLE SelectedUserAges (
  SelectedUserAgeID INT NOT NULL IDENTITY PRIMARY KEY,
  CourseDeptAndNumber VARCHAR(20), 
  Grade FLOAT,
  Credits FLOAT,
  [Time] FLOAT
)