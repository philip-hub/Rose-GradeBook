CREATE TYPE GradeDataAndSectionIDs AS TABLE ( 

  Sd int, -- sectionid
  Ge float -- grade
)

--https://www.mssqltips.com/sqlservertip/1483/using-table-valued-parameters-tvp-in-sql-server/
GO
-- use new tech to match on four fields, esp professor name
CREATE OR ALTER PROCEDURE getTakeIDs
(@data GradeDataAndSectionIDs READONLY,
@numRows int)
AS
BEGIN


SELECT (
  SELECT TakeID FROM Takes
  WHERE 
    TakeID IN (SELECT TOP (@numRows) TakeID FROM Takes ORDER BY TakeID DESC)
    AND Sd=CourseID
    AND Ge=Grade
    )
as TakeID
FROM @data 
END
GO

