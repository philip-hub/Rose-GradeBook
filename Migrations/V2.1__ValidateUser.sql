DELIMITER //
CREATE FUNCTION validateUser (userid INT,validationcode CHAR(4))
   RETURNS INT
   DETERMINISTIC
   BEGIN

SET @nummatches=(SELECT COUNT(*) FROM UserSignups WHERE UserID=userid AND `Code`=validationcode);

IF @nummatches = 0 THEN
	RETURN(-1);
END IF;

-- If it got here, it's an UPDATE of 1 record
UPDATE Users SET IsValidated=1 WHERE UserID=userid;

DELETE FROM UserSignups WHERE UserID=userid;

RETURN(0);
   END//
DELIMITER ;