-- returns userID
-- DROP PROCEDURE insertUser

DELIMITER //
CREATE PROCEDURE insertUser (IN email varchar(35), IN username varchar(10), IN password varchar(50), IN gpa float, IN  standing varchar(10), IN isadmin bit, IN majors varchar(150), IN validationcode CHAR(4))
proc: BEGIN
	START TRANSACTION;
	
	SET @expr1 = (SELECT COUNT(*) FROM Users WHERE Email=email);
	
	SET @expr2 = (SELECT IsValidated FROM Users WHERE Email=email);
	
	IF @expr1 > 0 THEN
	    IF @expr2 = 1 THEN
	    ROLLBACK;
			SET @temp = -1;
	        select @temp;
			LEAVE proc;
	    END IF;
	    SET @userid = (SELECT UserID FROM Users WHERE Email=email);
	    DELETE FROM UserMajors WHERE UserID=@userid;
	    DELETE FROM UserSignups WHERE UserID=@userid;
	    DELETE FROM Users WHERE Email=email;
	END IF;

	INSERT INTO Users VALUES (email,username,password,standing,isadmin,0,gpa);

    SET @userid = (SELECT LAST_INSERT_ID());

	INSERT INTO UserSignups VALUES (@userid,validationcode);
	
	SET @idx = 0;
	SET @majors_length = (LENGTH(majors));
	
	WHILE @idx <= @majors_length DO -- <= cuz 1-dexed
	    SET @nexMatch = (SELECT LOCATE(";", majors, @idx+1));
	    IF @nexMatch = 0 THEN -- not found
	        SET @nexMatch = @majors_length+1;
	    END IF;
	
		SET @major_str = (SELECT SUBSTRING(majors,@idx+1,@nexMatch-@idx-1));
	
--		 INSERT INTO majors_split VALUES (@major_str);
    SET @worked=(insertUserMajor(@userid,major_str));

	
	    IF @worked != 0 THEN -- not found
	    	ROLLBACK;
			SET @temp = -1;
	        select @temp;
			LEAVE proc;
	    END IF; 
		
	    SET @idx = @nexMatch;
	END WHILE;

COMMIT;

select @userid;
   END//
DELIMITER ;