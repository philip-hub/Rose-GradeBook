ALTER TABLE Takes
DROP COLUMN Grade;
GO

ALTER TABLE Takes
ADD Grade DECIMAL NULL;
