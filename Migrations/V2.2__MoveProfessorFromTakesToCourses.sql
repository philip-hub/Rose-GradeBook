ALTER TABLE Takes
DROP COLUMN Professor;
GO

ALTER TABLE Courses
ADD Professor VARCHAR(100) NULL;