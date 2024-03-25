
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
                                        @password varchar(50),@gpa decimal, 
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