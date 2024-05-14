DELIMITER //
CREATE FUNCTION changePassword(pword varchar(50), userid int, newPassword varchar(50))
   RETURNS INT
   DETERMINISTIC
   BEGIN

SET @matches=(SELECT COUNT(*) FROM Users WHERE UserID=userid AND `Password`=pword);

IF @matches <> 1 THEN
	RETURN(1);
END IF;

UPDATE Users SET `Password`=newPassword WHERE UserID=userid AND `Password`=pword;

RETURN(0);
END//

DELIMITER ;