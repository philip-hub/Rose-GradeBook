CREATE PROCEDURE getTakeIDs (numRows int)
BEGIN

CREATE TEMPORARY TABLE grade_data_and_section_data ( 
  Sd int, -- sectionid
  Ge float -- grade
);

SELECT (
    SELECT TakeID FROM Takes
  WHERE 
    TakeID IN (SELECT TakeID FROM Takes ORDER BY TakeID DESC LIMIT (numRows))
    AND Sd=CourseID
    AND (Ge=Grade OR (Ge is null and Grade is null))
    )
as TakeID
FROM grade_data_and_section_data;
END//
DELIMITER ;
