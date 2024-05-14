DELIMITER //
CREATE FUNCTION loginUser(email varchar(35), username varchar(10), pword varchar(50))
   RETURNS INT
   DETERMINISTIC
   BEGIN

SET @matching = 0;
SET @userid = 0;

IF (ISNULL(email) AND ISNULL(username)) THEN
   RETURN(-1);
END IF;
IF (NOT ISNULL(email) AND NOT ISNULL(username)) THEN
	SET @matching=(SELECT COUNT(*) FROM Users WHERE Email=email AND Username=username AND `Password`=pword);
END IF;
IF (ISNULL(email) AND NOT ISNULL(username)) THEN
	SET @matching=(SELECT COUNT(*) FROM Users WHERE Email=email AND `Password`=pword);
END IF;
IF (NOT ISNULL(email) AND ISNULL(username)) THEN
	SET @matching=(SELECT COUNT(*) FROM Users WHERE Username=username AND `Password`=pword);
END IF;

IF @matching != 1 THEN
	RETURN(-2);
END IF;

IF (NOT ISNULL(email) AND NOT ISNULL(username)) THEN
	SET @userid=(SELECT UserID FROM Users WHERE Email=email AND Username=username AND `Password`=pword);
END IF;
IF (ISNULL(email) AND NOT ISNULL(username)) THEN
	SET @userid=(SELECT UserID FROM Users WHERE Email=email AND `Password`=pword);
END IF;
IF (NOT ISNULL(email) AND ISNULL(username)) THEN
	SET @userid=(SELECT UserID FROM Users WHERE Username=username AND `Password`=pword);
END IF;

RETURN(@userid);
END//

DELIMITER ;