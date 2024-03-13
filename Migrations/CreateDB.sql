
CREATE DATABASE [OpenGradebook]
ON
  PRIMARY ( NAME=[OpenGradebook], 
  FILENAME='D:\rdsdbdata\DATA\OpenGradebook.mdf', 
  SIZE=6MB,
  MAXSIZE=5GB,
  FILEGROWTH=12%)
LOG ON
  ( NAME=[OpenGradebook_log], 
  FILENAME= 'D:\rdsdbdata\DATA\OpenGradebook_log.ldf', 
  SIZE=3MB,
  MAXSIZE=5GB,
  FILEGROWTH=17%)
COLLATE SQL_Latin1_General_Cp1_CI_AS