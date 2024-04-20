ALTER TABLE Takes
ADD CONSTRAINT Takes_Grade CHECK(0 <= Grade AND Grade <= 4);