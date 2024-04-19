CREATE TYPE SectionData AS TABLE ( 
  Id INT NOT NULL IDENTITY PRIMARY KEY,
  Ne VARCHAR(100),
  Dt VARCHAR(10),
  Cs int,
  Nr varchar(10),
  Yr Date,
  Qr varchar(10),
  Pr varchar(100),
  Cr varchar(20),
  Sn varchar(5)
)
GO

CREATE OR ALTER PROCEDURE insertSectionsUnique
@section_data SectionData READONLY
AS
BEGIN

INSERT INTO Courses
SELECT DISTINCT Ne,Dt, Cs ,Nr ,Yr,Qr,Pr,Cr,Sn
FROM @section_data
END

IF @@ERROR <> 0 
BEGIN
RETURN(1);
END
RETURN(0);

GO