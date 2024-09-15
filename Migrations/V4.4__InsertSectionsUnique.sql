CREATE TYPE SectionData AS TABLE ( 
  Ne VARCHAR(100),
  Dt VARCHAR(10),
  Cs int,
  Pr varchar(100),
  Nr varchar(10),
  Yr Date,
  Qr varchar(10),
  Cr varchar(20),
  Sn varchar(5)
)
GO

CREATE OR ALTER PROCEDURE insertSectionsUnique
@section_data SectionData READONLY
AS
BEGIN

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
FROM @section_data
END

IF @@ERROR <> 0 
BEGIN
RETURN(1);
END
RETURN(0);

GO

sp_help courses