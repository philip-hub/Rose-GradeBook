
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