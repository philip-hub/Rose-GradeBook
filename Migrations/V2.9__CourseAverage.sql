-- No need to weight by credits

-- Weight by the course overall, not the individual takes

--   Get lists of courses over which to average again
        --   coursedeptandnumber
        --   class year
        --   quarter
        --   professor
        --   nothing for all for all

CREATE OR ALTER PROCEDURE courseAverage(@courseid int,@average FLOAT OUTPUT)
AS
BEGIN
BEGIN TRANSACTION

SET @average=(
SELECT AVG(averages.average) FROM 
        (
        SELECT AVG(Grade) as average FROM Takes T
        JOIN Courses c ON t.CourseID=c.CourseID
        WHERE c.CourseID=@courseid  -- This is where we put conditions on courses averaged
        GROUP BY CourseDeptAndNumber
        ) AS averages
)

IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION
RETURN(1);
END

COMMIT TRANSACTION
RETURN(0);
END
GO