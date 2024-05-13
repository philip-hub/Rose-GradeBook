-- returns userID
CREATE FUNCTION insertUser (email varchar(35),username varchar(10),password varchar(50),gpa float, standing varchar(10),isadmin bit,majors varchar(150),validationcode CHAR(4))
AS
BEGIN
BEGIN TRANSACTION

DECLARE expr1 INT;
DECLARE expr2 INT;
DECLARE expr3 INT;

IF ((SELECT COUNT(*) FROM Users WHERE Email=email) > 0)
BEGIN

    IF ((SELECT IsValidated FROM Users WHERE Email=email) = 1)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(4);
    END

    SET userid = (SELECT UserID FROM Users WHERE Email=email)

    DELETE FROM UserMajors WHERE UserID=userid; 
    IF (ERROR <> 0)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(5);
    END
    DELETE FROM UserSignups WHERE UserID=userid; 
    IF (ERROR <> 0)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(6);
    END
    DELETE FROM Users WHERE Email=email; 
    IF (ERROR <> 0)
    BEGIN
    ROLLBACK TRANSACTION;
    RETURN(7);
    END

END

DECLARE separator varchar(1)=';'
DECLARE majors_split TABLE
([value] varchar(50),
ordinal int)

Insert into  majors_split([value],ordinal) select [value], ROW_NUMBER() OVER (
            ORDER BY [value]
            ) ordinal from STRING_SPLIT(majors,separator);

DECLARE numMajors int;
SET numMajors=(SELECT COUNT(*) FROM majors_split);

IF (numMajors > 3) -- Max number of majors
BEGIN
ROLLBACK TRANSACTION;
RETURN(3);
END

INSERT INTO Users VALUES (email,username,password,standing,isadmin,0,gpa);
IF (ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(1);
END

SET userid = IDENTITY;

DECLARE	return_value int
DECLARE counter INT = 1;
WHILE counter <= numMajors
BEGIN
    DECLARE major_str varchar(50);
    SET major_str=(SELECT [value] from majors_split where ordinal=counter);

    EXEC	return_value = insertUserMajor userid = userid, major = major_str;
    IF (return_value <> 0)
    BEGIN
        ROLLBACK TRANSACTION;
        RETURN(2);
    END
    
    SET counter = counter + 1;
END;

INSERT INTO UserSignups VALUES (userid,validationcode);
IF (ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(5);
END

COMMIT TRANSACTION
RETURN(0);
END
GO