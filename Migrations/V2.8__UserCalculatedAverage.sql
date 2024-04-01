-- The SQL to run first

-- DELETE FROM SelectedUserTakes WHERE UserID = @userid

-- INSERT INTO SelectedUserTakes
--    SELECT c.CourseDeptAndNumber, t.Grade, c.Credits, "UserID" = @userid,
--    "Time" =
--       CASE
--          WHEN c.[Quarter] = 'Fall' THEN 0+Year(c.[Year])
--          WHEN c.[Quarter] = 'Winter' THEN 0.25+Year(c.[Year])
--          WHEN c.[Quarter] = 'Spring' THEN 0.50+Year(c.[Year])
--          WHEN c.[Quarter] = 'Summer' THEN 0.75+Year(c.[Year])
--       END
--    FROM Courses c
--    JOIN Takes t ON c.CourseID=t.CourseID
--    WHERE t.UserID=@userid  -- This is where we put conditions on users averaged; use aapending

-- Run populateSelectedUserTakes SPROC first

CREATE OR ALTER PROCEDURE userCalculatedAverage(@userid int, @isDoubleMajor bit, @isTripleMajor bit,@average FLOAT OUTPUT)
AS
BEGIN
BEGIN TRANSACTION

IF (@isTripleMajor = 1)
BEGIN

DELETE FROM SelectedUserTakes WHERE UserID IN
(SELECT UserID FROM SelectedUserTakes u WHERE (SELECT COUNT(*) FROM UserMajors um WHERE um.UserID=u.UserID) = 3)

IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(1);
END

END

IF (@isDoubleMajor = 1)
BEGIN

DELETE FROM SelectedUserTakes WHERE UserID IN
(SELECT UserID FROM SelectedUserTakes u WHERE (SELECT COUNT(*) FROM UserMajors um WHERE um.UserID=u.UserID) = 2)

IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(2);
END

END


IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(1);
END

SET @average=
(
   (SELECT SUM(Grade*Credits) FROM SelectedUserTakes WHERE UserID=@userid AND [Time] = 
      (SELECT MAX([Time]) FROM SelectedUserTakes GROUP BY CourseDeptAndNumber)
   )
/
   (SELECT SUM(Credits) FROM SelectedUserTakes WHERE [Time] =
      (SELECT MAX([Time]) FROM SelectedUserTakes GROUP BY CourseDeptAndNumber)
   )
)

DELETE FROM SelectedUserTakes WHERE UserID = @userid
   -- This way it ends up with nothing allocated

IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(3);
END

COMMIT TRANSACTION
RETURN(0);
END
GO