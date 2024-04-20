CREATE TYPE ReviewData AS TABLE ( 
  Pf VARCHAR(100), -- professor
  Yr Date, -- year
  Qr varchar(10), -- quarter
  Cr varchar(20) -- courseDeptAndNumber
)

--https://www.mssqltips.com/sqlservertip/1483/using-table-valued-parameters-tvp-in-sql-server/
GO

-- use new tech to match on four fields, esp professor name
CREATE OR ALTER PROCEDURE getSectionIDs
@review_data ReviewData READONLY
AS
BEGIN
SELECT (
    SELECT TOP 1 CourseID FROM Courses
    WHERE Pf = 
        (CASE WHEN CHARINDEX('.', Professor) <> 0
        THEN SUBSTRING(Professor, 0, CHARINDEX('.', Professor)-2)
        ELSE SUBSTRING(Professor, 0, CHARINDEX('(', Professor)-1)
        END)
        AND Yr = [Year]
        AND Qr = [Quarter]
        AND Cr LIKE CourseDeptAndNumber+'%'
    ORDER BY CourseID DESC
    )
as SectionID
FROM @review_data 
END
GO

