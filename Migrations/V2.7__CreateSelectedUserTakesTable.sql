CREATE TABLE SelectedUserTakes (
  SelectedUserTakeID INT NOT NULL AUTO_INCREMENT,
  CourseID INT,
  CourseDeptAndNumber VARCHAR(20), 
  Grade FLOAT,
  Credits FLOAT,
  UserID INT,
  TakeUserID INT,
  `Time` FLOAT,
  PRIMARY KEY(SelectedUserTakeID)
)