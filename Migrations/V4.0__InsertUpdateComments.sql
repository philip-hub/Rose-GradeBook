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