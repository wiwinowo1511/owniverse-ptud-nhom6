/* Safe, additive migration for an existing Owniverse database.
   Does not create a database, drop objects, or change existing rows. */
USE Owniverse;
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

   
IF OBJECT_ID(N'dbo.Artists', N'U') IS NULL
    THROW 51000, 'dbo.Artists does not exist. Run the existing schema setup first.', 1;

IF COL_LENGTH(N'dbo.Artists', N'ProfileDataJson') IS NULL
BEGIN
    EXEC(N'
        ALTER TABLE dbo.Artists
        ADD ProfileDataJson NVARCHAR(MAX) NULL;
    ');
END;


 
IF NOT EXISTS (
    SELECT 1
    FROM sys.check_constraints
    WHERE parent_object_id = OBJECT_ID(N'dbo.Artists')
      AND name = N'CK_Artists_ProfileDataJson'
)
BEGIN
    EXEC(N'
        ALTER TABLE dbo.Artists WITH CHECK
        ADD CONSTRAINT CK_Artists_ProfileDataJson
        CHECK (
            ProfileDataJson IS NULL
            OR ISJSON(ProfileDataJson) = 1
        );
    ');
END;


    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;
GO
