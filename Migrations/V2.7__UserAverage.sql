-- Weight by credit

-- So this one will convert the two columns by using an epressino in the select after the group by
   -- Group by coursedeptandname

-- So this one will convert the two columns by using an epressino in the select after the group by
   -- Group by coursedeptandnumber
CREATE OR ALTER PROCEDURE userAverage(@userid int,@average DECIMAL OUTPUT)
AS
BEGIN
BEGIN TRANSACTION

--   SelectedUserAgeID INT NOT NULL IDENTITY PRIMARY KEY,
--   CourseID INT,
--   CourseDeptAndNumber VARCHAR(20),
--   Grade DECIMAL,
--   Credits DECIMAL,
--   UserID INT,
--   Professor VARCHAR(100),
-- --  [Name] VARCHAR(100) NOT NULL, -- Don't need course names
--   Dept VARCHAR(10),
-- --  [Number] VARCHAR(10) NOT NULL, -- Don't need the number
--   [Year] DATE,
--   [Quarter] VARCHAR(10),
--   [Time] DECIMAL

INSERT INTO SelectedUserAges
   SELECT c.CourseID, c.CourseDeptAndNumber, t.Grade, c.Credits, t.UserID, c.Professor,c.Dept,c.[Year],c.[Quarter], "Time" =
      CASE
         WHEN c.[Quarter] = 'Fall' THEN 0+Year(c.[Year])
         WHEN c.[Quarter] = 'Winter' THEN 0.25+Year(c.[Year])
         WHEN c.[Quarter] = 'Spring' THEN 0.50+Year(c.[Year])
         WHEN c.[Quarter] = 'Summer' THEN 0.75+Year(c.[Year])
      END
   FROM Courses c
   JOIN Takes t ON c.CourseID=t.CourseID
   WHERE t.UserID=@userid  -- This is where we put conditions on users averaged; use aapending

IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(1);
END

SET @average=
4*((SELECT SUM(Grade*Credits)
FROM SelectedUserAges WHERE [Time] =
(SELECT MAX([Time])
FROM SelectedUserAges GROUP BY CourseDeptAndNumber)
)
/
(SELECT SUM(Credits)
FROM SelectedUserAges WHERE [Time] =
(SELECT MAX([Time])
FROM SelectedUserAges GROUP BY CourseDeptAndNumber)
))

COMMIT TRANSACTION
RETURN(0);
END
GO