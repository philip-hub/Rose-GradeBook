CREATE TABLE CourseComments (
  CourseCommentID INT NOT NULL AUTO_INCREMENT,
  Likes INT NOT NULL,
  Comment VARCHAR(255) NULL,
  TakeID INT NOT NULL References Takes(TakeID),
  CONSTRAINT Positive_Likes CHECK(Likes > -1),
PRIMARY KEY(CourseCommentID)
)