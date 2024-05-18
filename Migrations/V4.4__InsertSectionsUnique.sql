DELIMITER //
CREATE FUNCTION insertSectionsUnique ()
   RETURNS INT
   DETERMINISTIC
   BEGIN

CREATE TEMPORARY TABLE section_data ( 
  Ne VARCHAR(100),
  Dt VARCHAR(10),
  Cs int,
  Pr varchar(100),
  Nr varchar(10),
  Yr Date,
  Qr varchar(10),
  Cr varchar(20),
  Sn varchar(5)
);

-- https://stackoverflow.com/questions/1641160/how-to-load-data-infile-on-amazon-rds
LOAD DATA LOCAL INFILE '/tmp/section_data.txt'
INTO TABLE section_data
FIELDS TERMINATED BY '|';

INSERT INTO Courses
SELECT DISTINCT --order gotta match
  Ne,
  Dt,
  Cs,
  Nr,
  Yr,
  Qr,
  Pr,
  Cr,
  Sn
FROM section_data;

RETURN(0);
END//
DELIMITER ;