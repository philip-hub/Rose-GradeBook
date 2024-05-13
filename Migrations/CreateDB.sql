CREATE TABLE UserSignups (
  UserSignupsID INT NOT NULL AUTO_INCREMENT,
  UserID INT NOT NULL,
  Code CHAR(4) NOT NULL,
  FOREIGN KEY(UserID) References Users(UserID),
  PRIMARY KEY(UserSignupsID)
)