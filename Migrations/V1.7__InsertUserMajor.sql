-- Call with all the different foods, looping through the dates and meal
CREATE OR ALTER PROCEDURE insertUserMajor (@userid INT, @major varchar(50))
AS
BEGIN
BEGIN TRANSACTION

INSERT INTO UserMajors(UserID,Major) VALUES (@userid,@major);
IF (@@ERROR <> 0)
BEGIN
ROLLBACK TRANSACTION;
RETURN(1);
END
COMMIT TRANSACTION
RETURN(0);
END
GO

-- -- Example call
-- declare @hmm int
--EXEC insertMealAndStatus @day= '2017-08-25', @meal= 'breakfast',@restaurantmealid=@hmm;
-- EXEC insertFood @json = N'{"id":"5423187","label":"yogurt vanilla low fat","description":"string","short_name":"string","raw_cooked":1010101,"meal":"dinner","tier":2,"nutritionless":false,"artificial_nutrition":false,"nutrition":{"kcal":"60","well_being":1010101},"station_id":1010101,"station":"string","nutrition_details":{"calories":{"value":"60","unit":"string"},"servingSize":{"value":"0.3","unit":"oz"},"fatContent":{"value":"1","unit":"string"},"carbohydrateContent":{"value":"9","unit":"string"},"proteinContent":{"value":"3","unit":"string"}},"ingredients":["string[]"],"sub_station_id":1010101,"sub_station":"string","sub_station_order":1010101,"monotony":{},"vegetarian":true,"vegan":false,"glutenfree":true}'
-- , @date = '2017-08-25',@meal = 'breakfast';

-- Invalid input that appears that appears in the data ('<1')
--  EXEC insertFood @json = N'{"id":"5423187","label":"yogurt vanilla low fat","description":"string","short_name":"string","raw_cooked":1010101,"meal":"dinner","tier":2,"nutritionless":false,"artificial_nutrition":false,"nutrition":{"kcal":"60","well_being":1010101},"station_id":1010101,"station":"string","nutrition_details":{"calories":{"value":"60","unit":"string"},"servingSize":{"value":"0.3","unit":"oz"},"fatContent":{"value":"1","unit":"string"},"carbohydrateContent":{"value":"9","unit":"string"},"proteinContent":{"value":"< 1","unit":"string"}},"ingredients":["string[]"],"sub_station_id":1010101,"sub_station":"string","sub_station_order":1010101,"monotony":{},"vegetarian":true,"vegan":false,"glutenfree":true}'
-- , @date = '2017-08-25',@meal = 'breakfast';

-- SELECT COUNT(*) FROM Food
-- DELETE FROM Food
