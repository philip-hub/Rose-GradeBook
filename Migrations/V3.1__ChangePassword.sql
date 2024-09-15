
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