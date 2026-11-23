USE Owniverse;
GO

SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET QUOTED_IDENTIFIER ON;
SET NUMERIC_ROUNDABORT OFF;
GO

IF COL_LENGTH('dbo.Users', 'Address') IS NULL
    ALTER TABLE dbo.Users ADD Address NVARCHAR(500) NOT NULL
        CONSTRAINT DF_Users_Address DEFAULT N'';
GO

IF COL_LENGTH('dbo.ProductVariants', 'DisplayName') IS NULL
    ALTER TABLE dbo.ProductVariants ADD DisplayName NVARCHAR(100) NOT NULL
        CONSTRAINT DF_ProductVariants_DisplayName DEFAULT N'Mặc định';
GO

IF COL_LENGTH('dbo.Communities', 'AvatarUrl') IS NULL
    ALTER TABLE dbo.Communities ADD AvatarUrl NVARCHAR(500) NULL;
GO

IF OBJECT_ID('dbo.ArtistApiData', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ArtistApiData (
        ArtistId INT NOT NULL,
        DataJson NVARCHAR(MAX) NOT NULL,
        CONSTRAINT PK_ArtistApiData PRIMARY KEY (ArtistId),
        CONSTRAINT FK_ArtistApiData_Artists FOREIGN KEY (ArtistId)
            REFERENCES dbo.Artists (ArtistId) ON DELETE CASCADE
    );
END;
GO

IF EXISTS (
    SELECT 1 FROM sys.key_constraints
    WHERE name = 'UQ_Artists_UserId' AND parent_object_id = OBJECT_ID('dbo.Artists')
)
    ALTER TABLE dbo.Artists DROP CONSTRAINT UQ_Artists_UserId;
GO

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Artists') AND name = 'UserId' AND is_nullable = 0
)
    ALTER TABLE dbo.Artists ALTER COLUMN UserId INT NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Artists_UserId' AND object_id = OBJECT_ID('dbo.Artists')
)
    CREATE UNIQUE INDEX UX_Artists_UserId
        ON dbo.Artists (UserId) WHERE UserId IS NOT NULL;
GO

IF EXISTS (
    SELECT 1 FROM sys.key_constraints
    WHERE name = 'UQ_ProductVariants_Product_Size_Color'
      AND parent_object_id = OBJECT_ID('dbo.ProductVariants')
)
    ALTER TABLE dbo.ProductVariants
        DROP CONSTRAINT UQ_ProductVariants_Product_Size_Color;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_ProductVariants_Product_Size_Color'
      AND object_id = OBJECT_ID('dbo.ProductVariants')
)
    CREATE UNIQUE INDEX UX_ProductVariants_Product_Size_Color
        ON dbo.ProductVariants (ProductId, Size, Color)
        WHERE Size IS NOT NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_ProductVariants_Product_Color'
      AND object_id = OBJECT_ID('dbo.ProductVariants')
)
    CREATE UNIQUE INDEX UX_ProductVariants_Product_Color
        ON dbo.ProductVariants (ProductId, Color)
        WHERE Size IS NULL AND Color IS NOT NULL;
GO
