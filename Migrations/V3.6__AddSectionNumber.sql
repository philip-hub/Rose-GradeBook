ALTER TABLE Courses
ADD Section VARCHAR(5) NULL;

ALTER TABLE Courses
DROP CONSTRAINT UC_Course

ALTER TABLE Courses
ADD CONSTRAINT UC_Course UNIQUE ([Number],Dept,[Year],[Quarter],[Section])