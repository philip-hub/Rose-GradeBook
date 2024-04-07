
CREATE OR ALTER PROCEDURE userCalculatedAverageCount(@userid int, @isDoubleMajor bit, @isTripleMajor bit,@average FLOAT OUTPUT)
AS
BEGIN
BEGIN TRANSACTION
   
   IF (@isTripleMajor = 1)
   BEGIN

      DELETE FROM SelectedUserTakes WHERE UserID IN -- we delete away takes belonging to invalid users
      (SELECT UserID FROM SelectedUserTakes u WHERE (SELECT COUNT(*) FROM UserMajors um WHERE um.UserID=u.UserID) <> 3 AND TakeUserID = @userid)
      AND TakeUserID = @userid -- everything we interact in thi sproc should have this to not mess with othera' use of the table

      IF (@@ERROR <> 0)
      BEGIN
      ROLLBACK TRANSACTION
      RETURN(1);
      END

   END

   IF (@isDoubleMajor = 1)
   BEGIN

      DELETE FROM SelectedUserTakes WHERE UserID IN -- we delete away takes belonging to invalid users
      (SELECT UserID FROM SelectedUserTakes u WHERE (SELECT COUNT(*) FROM UserMajors um WHERE um.UserID=u.UserID) <> 2  AND TakeUserID = @userid)
      AND TakeUserID = @userid -- everything we interact in thi sproc should have this to not mess with othera' use of the table

      IF (@@ERROR <> 0)
      BEGIN
      ROLLBACK TRANSACTION
      RETURN(2);
      END

   END

   IF ((SELECT COUNT(*) FROM SelectedUserTakes WHERE TakeUserID = @userid) = 0)
   BEGIN
   ROLLBACK TRANSACTION
   RETURN(3);
   END

   SET @average=
   (
      select count(averages.avg) from (SELECT SUM(Grade*Credits)/SUM(Credits) as avg FROM SelectedUserTakes s JOIN 
         (SELECT UserID,CourseID, CourseDeptAndNumber, ROW_NUMBER() OVER(Partition by CourseDeptAndNumber ORDER BY [Time] DESC) as Rank,[Time] FROM SelectedUserTakes WHERE takeuserid=@userid)
         latests on latests.CourseID=s.CourseID
         WHERE Rank=1
         GROUP BY s.UserID
      ) averages)

   DELETE FROM SelectedUserTakes WHERE TakeUserID = @userid
      -- This way it ends up with nothing allocated; this is the user for whom the operatino is happening, regartdless of what users are used as part of the calculation

   IF (@@ERROR <> 0)
   BEGIN
   ROLLBACK TRANSACTION
   RETURN(3);
   END

COMMIT TRANSACTION
RETURN(0);
END
GO