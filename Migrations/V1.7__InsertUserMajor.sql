
DELIMITER //
CREATE FUNCTION insertUserMajor (userid INT, major varchar(50))
   RETURNS INT
   DETERMINISTIC
   BEGIN
INSERT INTO UserMajors(UserID,Major) VALUES (userid,major);
   RETURN(0);
   END//
DELIMITER ;