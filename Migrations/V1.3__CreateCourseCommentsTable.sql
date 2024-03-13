--CourseCommented(ID, CID, Likes, Text, UserID)

CREATE TABLE CourseComments (
  CourseCommentID INT NOT NULL IDENTITY PRIMARY KEY,
  Likes INT NOT NULL,
  Comment VARCHAR(255) NULL,
  TakeID INT NOT NULL References Takes(TakeID),
  CONSTRAINT Positive_Likes CHECK(Likes > -1)
)