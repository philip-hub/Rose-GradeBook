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