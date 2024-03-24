--  c.CourseID, c.CourseDeptAndNumber, t.Grade, c.Credits, "Time"
        --   user (user-specific)
        --   user year (standing)
        --   major
        --   double majors (all, not specific)
        --   triple major (all, not specific)
        --   nothing for all for all

CREATE TABLE SelectedUserAges (
  SelectedUserAgeID INT NOT NULL IDENTITY PRIMARY KEY,
  CourseID INT,
  CourseDeptAndNumber VARCHAR(20),
  Grade DECIMAL,
  Credits DECIMAL,
  UserID INT,
  Professor VARCHAR(100),
--  [Name] VARCHAR(100) NOT NULL, -- Don't need course names
  Dept VARCHAR(10),
--  [Number] VARCHAR(10) NOT NULL, -- Don't need the number
  [Year] DATE,
  [Quarter] VARCHAR(10),
  [Time] DECIMAL
)