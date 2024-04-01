-- SELECT AVG(GPA) as average FROM Users u 
-- WHERE 0=0

-- For double or triple majors
-- AND UserID IN
-- (SELECT UserID FROM Users u WHERE (SELECT COUNT(*) FROM UserMajors um WHERE um.UserID=u.UserID) = 2)