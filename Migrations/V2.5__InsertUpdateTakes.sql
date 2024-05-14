DELIMITER //
CREATE FUNCTION insertUpdateTakes (userid INT,courseid INT,grade FLOAT)
   RETURNS INT
   DETERMINISTIC
   BEGIN
SET @expr1 = (SELECT COUNT(*) FROM Takes WHERE UserID=userid AND CourseID=courseid);
IF @expr1 = 0 THEN
    INSERT INTO Takes VALUES (userid,courseid,grade);
END IF;

UPDATE Takes SET Grade=grade WHERE UserID=userid AND CourseID=courseid;

RETURN(0);
END//
DELIMITER ;