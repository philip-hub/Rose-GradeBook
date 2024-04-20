CREATE TYPE TakeData AS TABLE ( 
  Ud int,
  Cd int,
  Ge FLOAT
)
GO

CREATE OR ALTER PROCEDURE InsertTakesUnique
(@take_data TakeData READONLY, @numRows INT OUTPUT)
AS
BEGIN

INSERT INTO Takes
SELECT DISTINCT Ud,Cd,Ge
FROM @take_data
END
SET @numRows = (SELECT @@ROWCOUNT);

IF @@ERROR <> 0 
BEGIN
RETURN(1);
END
-- 
RETURN(0);

GO