DELIMITER //
CREATE PROCEDURE getSectionIDs ()
BEGIN

CREATE TEMPORARY TABLE review_data ( 
  Pf VARCHAR(100), -- professor
  Yr Date, -- year
  Qr varchar(10), -- quarter
  Cr varchar(20) -- courseDeptAndNumber
);

-- https://stackoverflow.com/questions/1641160/how-to-load-data-infile-on-amazon-rds
LOAD DATA LOCAL INFILE '/tmp/review_data.txt'
INTO TABLE review_data
FIELDS TERMINATED BY '|';

SELECT (
    SELECT CourseID FROM Courses c
    WHERE Pf LIKE
        (CASE WHEN LOCATE('.', Professor) <> 0
        THEN SUBSTRING(Professor, 0, LOCATE('.', Professor)-2)
        ELSE SUBSTRING(Professor, 0, LOCATE('(', Professor)-1)
        END)+'%'
        AND Yr = c.Year
        AND Qr = c.Quarter
        AND Cr LIKE c.CourseDeptAndNumber+'%' -- none of this was null so no need for null check
    ORDER BY c.CourseID DESC LIMIT 1
    )
as SectionID
FROM review_data;
END//
DELIMITER ;
