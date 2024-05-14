DELIMITER //
CREATE FUNCTION updateProfile(userid int,
                                        pword varchar(50),gpa FLOAT, 
                                        standing varchar(10),isadmin bit,
                                        isvalidated bit,majors varchar(150))
   RETURNS INT
   DETERMINISTIC
   BEGIN

-- Update
UPDATE Users u SET `Password`=COALESCE(pword,`Password`), GPA=COALESCE(gpa,u.GPA), Standing=COALESCE(standing,u.Standing), IsAdmin=COALESCE(isadmin,u.IsAdmin), IsValidated=COALESCE(isvalidated,u.IsValidated) WHERE UserID=userid;

RETURN(0);
END//

DELIMITER ;