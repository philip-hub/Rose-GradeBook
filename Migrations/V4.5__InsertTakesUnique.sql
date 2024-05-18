CREATE FUNCTION insertTakesUnique ()
RETURNS INT
DETERMINISTIC
BEGIN

CREATE TEMPORARY TABLE take_data ( 
  Ud int,
  Cd int,
  Ge FLOAT
);

-- https://stackoverflow.com/questions/1641160/how-to-load-data-infile-on-amazon-rds
LOAD DATA LOCAL INFILE '/tmp/take_data.txt'
INTO TABLE take_data
FIELDS TERMINATED BY '|';

INSERT INTO Takes
SELECT DISTINCT Ud,Cd,Ge
FROM take_data
END

-- https://stackoverflow.com/questions/2229218/does-mysql-have-an-equivalent-to-rowcount-like-in-mssql
SET @numRows = (SELECT ROW_COUNT());

RETURN(@numRows);
END//
DELIMITER ;