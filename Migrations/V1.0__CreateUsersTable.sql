--User(ID, Email, Username, Password, Major, GPA, Standing)

CREATE TABLE Users (
  UserID INT NOT NULL AUTO_INCREMENT,
  Email VARCHAR(35) NOT NULL,
  Username VARCHAR(10) NOT NULL UNIQUE,
  `Password` VARCHAR(50) NOT NULL,
  Major VARCHAR(50) NOT NULL,
  GPA FLOAT NULL,
  Standing VARCHAR(10) NULL,
  `IsAdmin` BIT NOT NULL,
  PRIMARY KEY(UserID)
);