
CREATE DATABASE [OpenGradebook]
ON
  PRIMARY ( NAME=[OpenGradebook], 
  FILENAME='D:\rdsdbdata\DATA\OpenGradebook.mdf', 
  SIZE=6MB,
  MAXSIZE=5GB,
  FILEGROWTH=12%)
LOG ON
  ( NAME=[OpenGradebook_log], 
  FILENAME= 'D:\rdsdbdata\DATA\OpenGradebook_log.ldf', 
  SIZE=3MB,
  MAXSIZE=5GB,
  FILEGROWTH=17%)
COLLATE SQL_Latin1_General_Cp1_CI_AS
--User(ID, Email, Username, Password, Major, GPA, Standing)

CREATE TABLE Users (
  UserID INT NOT NULL IDENTITY PRIMARY KEY,
  Email VARCHAR(35) NOT NULL,
  Username VARCHAR(10) NOT NULL UNIQUE,
  [Password] VARCHAR(50) NOT NULL,
  Major VARCHAR(50) NOT NULL,
  GPA FLOAT NULL,
  Standing VARCHAR(10) NULL,
  [IsAdmin] BIT NOT NULL,
)
--Course(ID, Name, Dept, Credits, CID)

CREATE TABLE Courses (
  CourseID INT NOT NULL IDENTITY PRIMARY KEY,
  [Name] VARCHAR(100) NOT NULL,
  Dept VARCHAR(10) NOT NULL,
  Credits FLOAT(24) NULL,
  [Number] VARCHAR(10) NOT NULL,
  [Year] DATE NOT NULL,
  [Quarter] VARCHAR(10) NOT NULL,
  CONSTRAINT UC_Course UNIQUE ([Number],Dept,[Year],[Quarter]),
  CONSTRAINT Valid_Quarter CHECK( [Quarter] in ('Fall','Winter','Spring','Summer'))
)
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
--CourseCommented(ID, CID, Likes, Text, UserID)

CREATE TABLE CourseComments (
  CourseCommentID INT NOT NULL IDENTITY PRIMARY KEY,
  Likes INT NOT NULL,
  Comment VARCHAR(255) NULL,
  TakeID INT NOT NULL References Takes(TakeID),
  CONSTRAINT Positive_Likes CHECK(Likes > -1)
)
CREATE TABLE UserMajors (
  UserMajorID INT NOT NULL IDENTITY PRIMARY KEY,
  UserID INT NOT NULL,
  Major VARCHAR(50) NOT NULL,
  FOREIGN KEY(UserID) References Users(UserID)
)
ALTER TABLE Users
DROP COLUMN Major;
ALTER TABLE Users
ADD CONSTRAINT Users_UniqueEmail UNIQUE (Email);
-- Call with all the different foods, looping through the dates and meal
CREATE OR ALTER PROCEDURE insertUserMajor (@userid INT, @major varchar(50))
AS
BEGIN
BEGIN TRANSACTION

INSERT INTO UserMajors(UserID,Major) VALUES (@userid,@major);
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(1);
END
COMMIT TRANSACTION
RETURN(0);
END
GO

-- -- Example call
-- declare @hmm int
--EXEC insertMealAndStatus @day= '2017-08-25', @meal= 'breakfast',@restaurantmealid=@hmm;
-- EXEC insertFood @json = N'{"id":"5423187","label":"yogurt vanilla low fat","description":"string","short_name":"string","raw_cooked":1010101,"meal":"dinner","tier":2,"nutritionless":false,"artificial_nutrition":false,"nutrition":{"kcal":"60","well_being":1010101},"station_id":1010101,"station":"string","nutrition_details":{"calories":{"value":"60","unit":"string"},"servingSize":{"value":"0.3","unit":"oz"},"fatContent":{"value":"1","unit":"string"},"carbohydrateContent":{"value":"9","unit":"string"},"proteinContent":{"value":"3","unit":"string"}},"ingredients":["string[]"],"sub_station_id":1010101,"sub_station":"string","sub_station_order":1010101,"monotony":{},"vegetarian":true,"vegan":false,"glutenfree":true}'
-- , @date = '2017-08-25',@meal = 'breakfast';

-- Invalid input that appears that appears in the data ('<1')
--  EXEC insertFood @json = N'{"id":"5423187","label":"yogurt vanilla low fat","description":"string","short_name":"string","raw_cooked":1010101,"meal":"dinner","tier":2,"nutritionless":false,"artificial_nutrition":false,"nutrition":{"kcal":"60","well_being":1010101},"station_id":1010101,"station":"string","nutrition_details":{"calories":{"value":"60","unit":"string"},"servingSize":{"value":"0.3","unit":"oz"},"fatContent":{"value":"1","unit":"string"},"carbohydrateContent":{"value":"9","unit":"string"},"proteinContent":{"value":"< 1","unit":"string"}},"ingredients":["string[]"],"sub_station_id":1010101,"sub_station":"string","sub_station_order":1010101,"monotony":{},"vegetarian":true,"vegan":false,"glutenfree":true}'
-- , @date = '2017-08-25',@meal = 'breakfast';

-- SELECT COUNT(*) FROM Food
-- DELETE FROM Food
ALTER TABLE Users
ADD IsValidated BIT NOT NULL;
CREATE TABLE UserSignups (
  UserSignupsID INT NOT NULL IDENTITY PRIMARY KEY,
  UserID INT NOT NULL,
  Code CHAR(4) NOT NULL,
  FOREIGN KEY(UserID) References Users(UserID)
)
--   Email VARCHAR(35) NOT NULL,
--   Username VARCHAR(10) NOT NULL UNIQUE,
--   [Password] VARCHAR(50) NOT NULL,
--   Majors VARCHAR(50) NOT NULL,
--   GPA FLOAT NULL,
--   Standing VARCHAR(10) NULL,
--   [IsAdmin] BIT NOT NULL,

CREATE OR ALTER PROCEDURE insertUser (@email varchar(35),@username varchar(10),@password varchar(50),@gpa float, @standing varchar(10),@isadmin bit,@majors varchar(150),@validationcode CHAR(4),@userid INT OUTPUT)
AS
BEGIN
BEGIN TRANSACTION

IF ((SELECT COUNT(*) FROM Users WHERE Email=@email) > 0)
BEGIN

    IF ((SELECT IsValidated FROM Users WHERE Email=@email) = 1)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(4);
    END

    SET @userid = (SELECT UserID FROM Users WHERE Email=@email)

    DELETE FROM UserMajors WHERE UserID=@userid; 
    IF (@@ERROR <> 0)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(5);
    END
    DELETE FROM UserSignups WHERE UserID=@userid; 
    IF (@@ERROR <> 0)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(6);
    END
    DELETE FROM Users WHERE Email=@email; 
    IF (@@ERROR <> 0)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(7);
    END

END

DECLARE @separator varchar(1)=';'
DECLARE @majors_split TABLE
([value] varchar(50),
ordinal int)

Insert into  @majors_split([value],ordinal) select [value], ROW_NUMBER() OVER (
            ORDER BY [value]
            ) ordinal from STRING_SPLIT(@majors,@separator);

DECLARE @numMajors int;
SET @numMajors=(SELECT COUNT(*) FROM @majors_split);

IF (@numMajors > 3) -- Max number of majors
BEGIN
ROLLBACK TRANSACTION;
RETURN(3);
END

INSERT INTO Users VALUES (@email,@username,@password,@standing,@isadmin,0,@gpa);
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(1);
END

SET @userid = @@IDENTITY;

DECLARE	@return_value int
DECLARE @counter INT = 1;
WHILE @counter <= @numMajors
BEGIN
    DECLARE @major_str varchar(50);
    SET @major_str=(SELECT [value] from @majors_split where ordinal=@counter);

    EXEC	@return_value = insertUserMajor @userid = @userid, @major = @major_str;
    IF (@return_value <> 0)
    BEGIN
        ROLLBACK TRANSACTION;
        RETURN(2);
    END
    
    SET @counter = @counter + 1;
END;

INSERT INTO UserSignups VALUES (@userid,@validationcode);
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(5);
END

COMMIT TRANSACTION
RETURN(0);
END
GO
CREATE OR ALTER PROCEDURE validateUser (@userid INT,@validationcode CHAR(4))
AS
BEGIN
BEGIN TRANSACTION

DECLARE @nummatches int;
SET @nummatches=(SELECT COUNT(*) FROM UserSignups WHERE UserID=@userid AND  Code=@validationcode)

IF (@nummatches = 0) -- INSERT Check
BEGIN
RETURN(1);
END

-- If it got here, it's an UPDATE of 1 record
UPDATE Users SET IsValidated=1 WHERE UserID=@userid
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(2);
END

DELETE FROM UserSignups WHERE UserID=@userid
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(3);
END

RETURN(0);
END
GO
ALTER TABLE Takes
DROP COLUMN Professor;
GO

ALTER TABLE Courses
ADD Professor VARCHAR(100) NULL;
ALTER TABLE Takes
DROP COLUMN Grade;
GO

ALTER TABLE Takes
ADD Grade FLOAT NULL;

ALTER TABLE Users
DROP COLUMN GPA;
GO

ALTER TABLE Users
ADD GPA Float NULL;
CREATE OR ALTER PROCEDURE insertUpdateTakes (@userid INT,@courseid INT,@grade FLOAT)
AS
BEGIN
BEGIN TRANSACTION

IF ((SELECT COUNT(*) FROM Takes WHERE UserID=@userid AND CourseID=@courseid) = 0) -- INSERT Check
BEGIN
    INSERT INTO Takes VALUES (@userid,@courseid,@grade);
    IF (@@ERROR <> 0)
    BEGIN
        ROLLBACK TRANSACTION;
        RETURN(1);
    END
END

-- If it got here, it's an UPDATE of 1 record
UPDATE Takes SET Grade=@grade WHERE UserID=@userid AND CourseID=@courseid
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(3);
END



COMMIT TRANSACTION
RETURN(0);
END
GO
ALTER TABLE Courses
ADD CourseDeptAndNumber VARCHAR(20) NULL;
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

CREATE OR ALTER PROCEDURE userCalculatedAverage(@userid int, @isDoubleMajor bit, @isTripleMajor bit,@average FLOAT OUTPUT)
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
      select avg(averages.avg) from (SELECT SUM(Grade*Credits)/SUM(Credits) as avg FROM SelectedUserTakes s JOIN 
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

CREATE OR ALTER PROCEDURE userCalculatedAverageStdDev(@userid int, @isDoubleMajor bit, @isTripleMajor bit,@average FLOAT OUTPUT)
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
      select STDEV(averages.avg) from (SELECT SUM(Grade*Credits)/SUM(Credits) as avg FROM SelectedUserTakes s JOIN 
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

CREATE OR ALTER PROCEDURE loginUser(@email varchar(35), @username varchar(10), @password varchar(50), @userid int output)
AS
BEGIN

DECLARE @matching int;

IF (@email is null AND @username is null)
BEGIN
RETURN(1);
END
IF (@email is not null AND @username is not null)
BEGIN
SET @matching=(SELECT COUNT(*) FROM Users WHERE Email=@email AND Username=@username AND [Password]=@password)
END
IF (@email is null AND @username is not null)
BEGIN
SET @matching=(SELECT COUNT(*) FROM Users WHERE Email=@email AND [Password]=@password)
END
IF (@email is not null AND @username is null)
BEGIN
SET @matching=(SELECT COUNT(*) FROM Users WHERE Username=@username AND [Password]=@password)
END

IF (@matching <> 1)
BEGIN
RETURN(2);
END

IF (@email is not null AND @username is not null)
BEGIN
SET @userid=(SELECT UserID FROM Users WHERE Email=@email AND Username=@username AND [Password]=@password)
END
IF (@email is null AND @username is not null)
BEGIN
SET @userid=(SELECT UserID FROM Users WHERE Email=@email AND [Password]=@password)
END
IF (@email is not null AND @username is null)
BEGIN
SET @userid=(SELECT UserID FROM Users WHERE Username=@username AND [Password]=@password)
END

RETURN(0);
END
GO

CREATE OR ALTER PROCEDURE changePassword(@password varchar(50), @userid int, @newPassword varchar(50))
AS
BEGIN

DECLARE @matches int;
SET @matches=(SELECT COUNT(*) FROM Users WHERE UserID=@userid AND [Password]=@password)

IF (@matches <> 1)
BEGIN
RETURN(1);
END

UPDATE Users SET [Password]=@newPassword WHERE UserID=@userid AND [Password]=@password

RETURN(0);
END
GO
ALTER TABLE Users
ADD CONSTRAINT Users_GPA CHECK(0 < GPA AND GPA < 4);
ALTER TABLE Takes
ADD CONSTRAINT Takes_Grade CHECK(0 <= Grade AND Grade <= 4);

-- CREATE TABLE Users (
--   UserID INT NOT NULL IDENTITY PRIMARY KEY,
--   Email VARCHAR(35) NOT NULL,
--   Username VARCHAR(10) NOT NULL UNIQUE,
--   [Password] VARCHAR(50) NOT NULL,
--   Major VARCHAR(50) NOT NULL,
--   GPA FLOAT NULL,
--   Standing VARCHAR(10) NULL,
--   [IsAdmin] BIT NOT NULL,
-- )

CREATE OR ALTER PROCEDURE updateProfile(--@email varchar(35),@username varchar(10),
                                        @userid int,
                                        @password varchar(50),@gpa FLOAT, 
                                        @standing varchar(10),@isadmin bit,
                                        @isvalidated bit,@majors varchar(150))
AS
BEGIN
BEGIN TRANSACTION

-- Password Update
IF (@password is not null)
BEGIN
UPDATE Users SET [Password]=@password WHERE UserID=@userid
END
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(1);
END

-- GPA Update
IF (@gpa is not null)
BEGIN
UPDATE Users SET [GPA]=@gpa WHERE UserID=@userid
END
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(2);
END

-- Standing Update
IF (@standing is not null)
BEGIN
UPDATE Users SET [standing]=@standing WHERE UserID=@userid
END
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(3);
END

-- IsAdmin Update
IF (@isadmin is not null)
BEGIN
UPDATE Users SET [IsAdmin]=@isadmin WHERE UserID=@userid
END
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(4);
END

-- IsValidated Update
IF (@isvalidated is not null)
BEGIN
UPDATE Users SET [IsValidated]=@isvalidated WHERE UserID=@userid
END
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(5);
END

-- Add Majors
DECLARE @separator varchar(1)=';'
DECLARE @majors_split TABLE
([value] varchar(50),
ordinal int)
DELETE FROM UserMajors WHERE UserID=@userid
Insert into  @majors_split([value],ordinal) select [value], ROW_NUMBER() OVER (
            ORDER BY [value]
            ) ordinal from STRING_SPLIT(@majors,@separator);
DECLARE @numMajors int;
SET @numMajors=(SELECT COUNT(*) FROM @majors_split);
IF (@numMajors > 3) -- Max number of majors
BEGIN
ROLLBACK TRANSACTION;
RETURN(6);
END
DECLARE	@return_value int
DECLARE @counter INT = 1;
WHILE @counter <= @numMajors
BEGIN
    DECLARE @major_str varchar(50);
    SET @major_str=(SELECT [value] from @majors_split where ordinal=@counter);

    EXEC	@return_value = insertUserMajor @userid = @userid, @major = @major_str;
    IF (@return_value <> 0)
    BEGIN
        ROLLBACK TRANSACTION;
        RETURN(2);
    END
    
    SET @counter = @counter + 1;
END;


COMMIT TRANSACTION
RETURN(0);
END
GO

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
ALTER TABLE Courses
ADD Section VARCHAR(5) NULL;

ALTER TABLE Courses
DROP CONSTRAINT UC_Course

ALTER TABLE Courses
ADD CONSTRAINT UC_Course UNIQUE ([Number],Dept,[Year],[Quarter],[Section])
ALTER TABLE CourseComments
ADD CommentDate DATE NOT NULL;
ALTER TABLE CourseComments
DROP COLUMN Comment;

ALTER TABLE CourseComments
ADD Comment VARCHAR(1000) NULL
ALTER TABLE CourseComments
DROP CONSTRAINT Positive_Likes
CREATE OR ALTER PROCEDURE insertUpdateComment (@likes INT,@takeid INT,@commentdate DATE,@comment varchar(1000), @overwrite bit)
AS
BEGIN
BEGIN TRANSACTION

IF (@overwrite = 1)
BEGIN
IF ((SELECT COUNT(*) FROM CourseComments WHERE TakeID=@takeid) > 0)
BEGIN
    UPDATE CourseComments SET Likes=@likes,CommentDate=@commentdate,Comment=@comment WHERE TakeID=@takeid;
    IF (@@ERROR <> 0)
    BEGIN
        ROLLBACK TRANSACTION;
        RETURN(1);
    END
END
END
ELSE
BEGIN
    ROLLBACK TRANSACTION;
    RETURN(1);
END

INSERT INTO CourseComments VALUES (@likes,@takeid,@commentdate,@comment);
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(2);
END

COMMIT TRANSACTION
RETURN(0);
END
GO
ALTER TABLE Takes
ALTER COLUMN UserID INT NULL
ALTER TABLE Takes
DROP CONSTRAINT UC_UserCourse;
CREATE TYPE ReviewData AS TABLE ( 
  Pf VARCHAR(100), -- professor
  Yr Date, -- year
  Qr varchar(10), -- quarter
  Cr varchar(20) -- courseDeptAndNumber
)

--https://www.mssqltips.com/sqlservertip/1483/using-table-valued-parameters-tvp-in-sql-server/
GO

-- use new tech to match on four fields, esp professor name
CREATE OR ALTER PROCEDURE getSectionIDs
@review_data ReviewData READONLY
AS
BEGIN
SELECT (
    SELECT TOP 1 CourseID FROM Courses
    WHERE Pf LIKE
        (CASE WHEN CHARINDEX('.', Professor) <> 0
        THEN SUBSTRING(Professor, 0, CHARINDEX('.', Professor)-2)
        ELSE SUBSTRING(Professor, 0, CHARINDEX('(', Professor)-1)
        END)+'%'
        AND Yr = [Year]
        AND Qr = [Quarter]
        AND Cr LIKE CourseDeptAndNumber+'%' -- none of this was null so no need for null check
    ORDER BY CourseID DESC
    )
as SectionID
FROM @review_data 
END
GO

CREATE TYPE SectionData AS TABLE ( 
  Ne VARCHAR(100),
  Dt VARCHAR(10),
  Cs int,
  Pr varchar(100),
  Nr varchar(10),
  Yr Date,
  Qr varchar(10),
  Cr varchar(20),
  Sn varchar(5)
)
GO

CREATE OR ALTER PROCEDURE insertSectionsUnique
@section_data SectionData READONLY
AS
BEGIN

INSERT INTO Courses
SELECT DISTINCT --order gotta match
  Ne,
  Dt,
  Cs,
  Nr,
  Yr,
  Qr,
  Pr,
  Cr,
  Sn
FROM @section_data
END

IF @@ERROR <> 0 
BEGIN
RETURN(1);
END
RETURN(0);

GO

sp_help courses
CREATE TYPE TakeData AS TABLE ( 
  Ud int,
  Cd int,
  Ge FLOAT
)
GO

CREATE OR ALTER PROCEDURE InsertTakesUnique
(@take_data TakeData READONLY, @numRows INT OUTPUT)
AS
BEGIN

INSERT INTO Takes
SELECT DISTINCT Ud,Cd,Ge
FROM @take_data
END
SET @numRows = (SELECT @@ROWCOUNT);

IF @@ERROR <> 0 
BEGIN
RETURN(1);
END
-- 
RETURN(0);

GO
CREATE TYPE GradeDataAndSectionIDs AS TABLE ( 

  Sd int, -- sectionid
  Ge float -- grade
)

--https://www.mssqltips.com/sqlservertip/1483/using-table-valued-parameters-tvp-in-sql-server/
GO
-- use new tech to match on four fields, esp professor name
CREATE OR ALTER PROCEDURE getTakeIDs
(@data GradeDataAndSectionIDs READONLY,
@numRows int)
AS
BEGIN


SELECT (
  
  SELECT TakeID FROM Takes
  WHERE 
    TakeID IN (SELECT TOP (@numRows) TakeID FROM Takes ORDER BY TakeID DESC)
    AND Sd=CourseID
    AND (Ge=Grade OR (Ge is null and Grade is null))
    )
as TakeID
FROM @data 
END
GO
ALTER TABLE Courses
DROP Constraint UC_Course
