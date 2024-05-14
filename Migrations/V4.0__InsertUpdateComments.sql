DELIMITER //
CREATE FUNCTION insertUpdateComment (likes INT,takeid INT,commentdate DATE,cmmt varchar(1000), overwrite bit)
   RETURNS INT
   DETERMINISTIC
   BEGIN

IF overwrite = 1 THEN
	SET @expr1 = (SELECT COUNT(*) FROM CourseComments WHERE TakeID=takeid);
	IF @expr1 > 0 THEN
	    UPDATE CourseComments SET Likes=likes,CommentDate=commentdate,`Comment`=cmmt WHERE TakeID=takeid;
	END IF;
END IF;

INSERT INTO CourseComments VALUES (likes,takeid,commentdate,cmmt);

RETURN(0);
END//
DELIMITER ;