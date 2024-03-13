--Course(ID, Name, Dept, Credits, CID)

CREATE TABLE Courses (
  CourseID INT NOT NULL IDENTITY PRIMARY KEY,
  [Name] VARCHAR(50) NOT NULL,
  Dept VARCHAR(35) NULL,
  Credits INT NULL,
  [Number] VARCHAR(10) NOT NULL,
  CONSTRAINT UC_Course UNIQUE ([Number],Dept)
)