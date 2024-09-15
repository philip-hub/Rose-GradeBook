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