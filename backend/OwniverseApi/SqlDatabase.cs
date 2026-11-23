using System.Text.Json;
using System.Text.Json.Nodes;
using Dapper;
using Microsoft.Data.SqlClient;

sealed class SqlDatabase(string connectionString)
{
    private readonly SemaphoreSlim saveLock = new(1, 1);
    private readonly JsonSerializerOptions jsonOptions = new(JsonSerializerDefaults.Web);

    public async Task CheckConnectionAsync()
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();
        await connection.ExecuteScalarAsync<int>("SELECT 1");
    }

    public async Task LoadAsync(
        List<User> users,
        List<Artist> artists,
        List<Category> categories,
        List<Product> products,
        List<Community> communities,
        List<CommunityMember> communityMembers,
        List<PasswordResetToken> passwordResetTokens,
        Dictionary<int, List<CartItem>> carts,
        List<Order> orders)
    {
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        users.Clear();
        users.AddRange(await connection.QueryAsync<User>(
            """
            SELECT UserId AS Id, FullName, Email, PasswordHash AS Password,
                   COALESCE(Phone, '') AS Phone, LOWER(Role) AS Role,
                   LOWER(Status) AS Status, CreatedAt
            FROM dbo.Users
            """));

        var fallbackArtists = SeedData.CreateArtists().ToDictionary(a => a.Slug, StringComparer.OrdinalIgnoreCase);
        var metadata = (await connection.QueryAsync<ArtistMetadataRow>(
            "SELECT ArtistId, DataJson FROM dbo.ArtistApiData")).ToDictionary(row => row.ArtistId);
        var artistRows = await connection.QueryAsync<ArtistRow>(
            """
            SELECT a.ArtistId AS Id, a.UserId, a.Slug, a.Name, a.ProfileDataJson,
                   COALESCE(a.Style, '') AS Genre, COALESCE(a.Bio, '') AS Description,
                   COALESCE(a.CoverUrl, '') AS Cover, COALESCE(a.AvatarUrl, '') AS Avatar,
                   LOWER(a.Status) AS Status, d.DataJson
            FROM dbo.Artists a
            LEFT JOIN dbo.ArtistApiData d ON d.ArtistId = a.ArtistId
            """);

        artists.Clear();
        foreach (var row in artistRows)
        {
            Artist artist;
            if (row.DataJson is not null)
            {
                artist = JsonSerializer.Deserialize<Artist>(row.DataJson, jsonOptions) ?? new Artist();
                try
                {
                    using var document = JsonDocument.Parse(row.DataJson);
                    if (document.RootElement.TryGetProperty("adminNote", out var note) && note.ValueKind == JsonValueKind.String)
                        artist.AdminNote = note.GetString() ?? "";
                }
                catch (JsonException)
                {
                    // Ignore malformed optional admin metadata and keep the database columns as the source of truth.
                }
            }
            else if (row.ProfileDataJson is not null)
                artist = JsonSerializer.Deserialize<Artist>(row.ProfileDataJson, jsonOptions) ?? new Artist();
            else if (!fallbackArtists.TryGetValue(row.Slug, out artist!))
                artist = new Artist();

            artist.Id = row.Id;
            artist.UserId = row.UserId;
            artist.Slug = row.Slug;
            artist.Name = row.Name;
            artist.Genre = row.Genre;
            artist.Description = row.Description;
            artist.Cover = row.Cover;
            artist.Avatar = row.Avatar;
            artist.Status = row.Status;
            artists.Add(artist);
        }

        categories.Clear();
        categories.AddRange(await connection.QueryAsync<Category>(
            "SELECT CategoryId AS Id, Slug, Name FROM dbo.Categories WHERE IsActive = 1"));

        var productRows = await connection.QueryAsync<ProductRow>(
            """
            SELECT ProductId AS Id, Name, COALESCE(Description, '') AS Description,
                   CAST(BasePrice AS INT) AS Price, ArtistId, CategoryId,
                   LOWER(Status) AS Status
            FROM dbo.Products
            """);
        var productList = productRows.ToList();
        var images = (await connection.QueryAsync<ProductImageRow>(
            """
            SELECT ProductId, ImageUrl, IsPrimary, SortOrder
            FROM dbo.ProductImages
            ORDER BY ProductId, IsPrimary DESC, SortOrder
            """)).GroupBy(row => row.ProductId).ToDictionary(group => group.Key, group => group.ToList());
        var variants = (await connection.QueryAsync<VariantRow>(
            """
            SELECT VariantId AS Id, ProductId, Sku, DisplayName AS Name,
                   StockQuantity AS Stock
            FROM dbo.ProductVariants
            WHERE IsActive = 1
            ORDER BY VariantId
            """)).GroupBy(row => row.ProductId).ToDictionary(group => group.Key, group => group.ToList());

        products.Clear();
        foreach (var row in productList)
        {
            var productImages = images.GetValueOrDefault(row.Id) ?? new List<ProductImageRow>();
            products.Add(new Product
            {
                Id = row.Id,
                Name = row.Name,
                Description = row.Description,
                Price = row.Price,
                ArtistId = row.ArtistId,
                CategoryId = row.CategoryId,
                Image = productImages.FirstOrDefault(image => image.IsPrimary)?.ImageUrl
                    ?? productImages.FirstOrDefault()?.ImageUrl ?? "",
                Images = productImages.Select(image => image.ImageUrl).ToList(),
                Status = row.Status == "active" ? "active" : "hidden",
                Variants = (variants.GetValueOrDefault(row.Id) ?? new List<VariantRow>())
                    .Select(variant => new ProductVariant
                    {
                        Id = variant.Id,
                        Sku = variant.Sku,
                        Name = variant.Name,
                        Stock = variant.Stock,
                    }).ToList(),
            });
        }

        var communityRows = await connection.QueryAsync<Community>(
            """
            SELECT CommunityId AS Id, ArtistId, Name,
                   COALESCE(Description, '') AS Description,
                   COALESCE(AvatarUrl, '') AS Avatar,
                   COALESCE(CoverUrl, '') AS Cover
            FROM dbo.Communities
            """);
        communities.Clear();
        communities.AddRange(communityRows);

        var memberRows = await connection.QueryAsync<CommunityMember>(
            "SELECT CommunityId, UserId FROM dbo.CommunityMembers");
        communityMembers.Clear();
        communityMembers.AddRange(memberRows);

        var tokenRows = await connection.QueryAsync<ResetTokenRow>(
            """
            SELECT UserId, TokenHash, ExpiresAt, UsedAt
            FROM dbo.PasswordResetTokens
            """);
        passwordResetTokens.Clear();
        passwordResetTokens.AddRange(tokenRows.Select(row => new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            UserId = row.UserId,
            TokenHash = row.TokenHash,
            ExpiresAt = row.ExpiresAt,
            UsedAt = row.UsedAt,
        }));

        var cartRows = await connection.QueryAsync<CartRow>(
            """
            SELECT c.UserId, ci.VariantId, ci.Quantity
            FROM dbo.Carts c
            JOIN dbo.CartItems ci ON ci.CartId = c.CartId
            """);
        carts.Clear();
        foreach (var row in cartRows)
        {
            if (!carts.TryGetValue(row.UserId, out var cart))
                carts[row.UserId] = cart = new List<CartItem>();
            cart.Add(new CartItem { VariantId = row.VariantId, Quantity = row.Quantity });
        }

        var orderRows = (await connection.QueryAsync<Order>(
            """
            SELECT OrderId AS Id, OrderCode AS Code, UserId, ReceiverName,
                   ReceiverPhone, ShippingAddress, COALESCE(Note, '') AS Note,
                   ShippingFee, TotalAmount, OrderStatus AS Status, CreatedAt
            FROM dbo.Orders
            """)).ToList();
        var orderItems = (await connection.QueryAsync<OrderItemRow>(
            """
            SELECT OrderId, VariantId, ProductName, Sku,
                   CAST(UnitPrice AS INT) AS UnitPrice, Quantity
            FROM dbo.OrderItems
            """)).GroupBy(row => row.OrderId).ToDictionary(group => group.Key, group => group.ToList());
        foreach (var order in orderRows)
        {
            order.Items = (orderItems.GetValueOrDefault(order.Id) ?? new List<OrderItemRow>())
                .Select(item => new OrderItem
                {
                    VariantId = item.VariantId,
                    ProductName = item.ProductName,
                    Sku = item.Sku,
                    UnitPrice = item.UnitPrice,
                    Quantity = item.Quantity,
                }).ToList();
        }
        orders.Clear();
        orders.AddRange(orderRows);
    }

    public async Task SaveAsync(
        IReadOnlyCollection<User> users,
        IReadOnlyCollection<Artist> artists,
        IReadOnlyCollection<Category> categories,
        IReadOnlyCollection<Product> products,
        IReadOnlyCollection<Community> communities,
        IReadOnlyCollection<CommunityMember> communityMembers,
        IReadOnlyCollection<PasswordResetToken> passwordResetTokens,
        IReadOnlyDictionary<int, List<CartItem>> carts,
        IReadOnlyCollection<Order> orders)
    {
        await saveLock.WaitAsync();
        try
        {
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();
            try
            {
                await SaveUsersAsync(connection, transaction, users);
                await SaveArtistsAsync(connection, transaction, artists);
                await SaveCategoriesAsync(connection, transaction, categories);
                await SaveProductsAsync(connection, transaction, products);
                await SaveCommunitiesAsync(connection, transaction, communities);
                await SaveCommunityMembersAsync(connection, transaction, communityMembers);
                await SaveResetTokensAsync(connection, transaction, passwordResetTokens);
                await SaveCartsAsync(connection, transaction, carts);
                await SaveOrdersAsync(connection, transaction, orders);
                await DeleteMissingAsync(connection, transaction, "dbo.Communities", "CommunityId", communities.Select(item => item.Id));
                await DeleteMissingAsync(connection, transaction, "dbo.Products", "ProductId", products.Select(item => item.Id));
                await DeleteMissingAsync(connection, transaction, "dbo.Categories", "CategoryId",
                    categories.Select(item => item.Id), activeOnly: true);
                await DeleteMissingAsync(connection, transaction, "dbo.Artists", "ArtistId", artists.Select(item => item.Id));
                await DeleteMissingAsync(connection, transaction, "dbo.Users", "UserId", users.Select(item => item.Id));
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
        finally
        {
            saveLock.Release();
        }
    }

    private async Task SaveUsersAsync(SqlConnection connection, SqlTransaction transaction, IEnumerable<User> users)
    {
        foreach (var user in users)
        {
            var args = new
            {
                user.Id, user.FullName, user.Email, user.Password, user.Phone, user.Address,
                Role = ToDatabaseCase(user.Role), Status = ToDatabaseCase(user.Status), user.CreatedAt,
            };
            await UpsertIdentityAsync(connection, transaction, "dbo.Users", args,
                """
                UPDATE dbo.Users SET FullName=@FullName, Email=@Email, PasswordHash=@Password,
                    Phone=@Phone, Address=@Address, Role=@Role, Status=@Status
                WHERE UserId=@Id
                """,
                """
                INSERT dbo.Users (UserId, FullName, Email, PasswordHash, Phone, Address, Role, Status, CreatedAt)
                VALUES (@Id, @FullName, @Email, @Password, @Phone, @Address, @Role, @Status, @CreatedAt)
                """);
        }
    }

    private async Task SaveArtistsAsync(SqlConnection connection, SqlTransaction transaction, IEnumerable<Artist> artists)
    {
        foreach (var artist in artists)
        {
            var args = new
            {
                artist.Id, artist.UserId, artist.Name, artist.Slug, Bio = artist.Description,
                Style = artist.Genre, AvatarUrl = artist.Avatar, CoverUrl = artist.Cover,
                Status = artist.Status == "active" ? "Active" : "Inactive",
            };
            await connection.ExecuteAsync(
                """
                UPDATE dbo.Artists SET UserId=@UserId, Name=@Name, Slug=@Slug, Bio=@Bio,
                    Style=@Style, AvatarUrl=@AvatarUrl, CoverUrl=@CoverUrl, Status=@Status,
                    UpdatedAt=SYSUTCDATETIME()
                WHERE ArtistId=@Id
                """, args, transaction);
            if (!await ExistsAsync(connection, transaction, "dbo.Artists", "ArtistId", artist.Id))
                await UpsertIdentityAsync(connection, transaction, "dbo.Artists", args, "SELECT 0 WHERE 1=0",
                    """
                    INSERT dbo.Artists (ArtistId, UserId, Name, Slug, Bio, Style, AvatarUrl, CoverUrl, Status)
                    VALUES (@Id, @UserId, @Name, @Slug, @Bio, @Style, @AvatarUrl, @CoverUrl, @Status)
                    """);

            await connection.ExecuteAsync(
                """
                UPDATE dbo.ArtistApiData SET DataJson=@DataJson WHERE ArtistId=@ArtistId;
                IF @@ROWCOUNT = 0
                    INSERT dbo.ArtistApiData (ArtistId, DataJson) VALUES (@ArtistId, @DataJson);
                """,
                new { ArtistId = artist.Id, DataJson = SerializeArtistData(artist) }, transaction);
        }
    }

    private string SerializeArtistData(Artist artist)
    {
        var data = JsonSerializer.SerializeToNode(artist, jsonOptions) as JsonObject ?? new JsonObject();
        data["adminNote"] = artist.AdminNote;
        return data.ToJsonString(jsonOptions);
    }

    private async Task SaveCategoriesAsync(SqlConnection connection, SqlTransaction transaction, IEnumerable<Category> categories)
    {
        foreach (var category in categories)
        {
            var args = new { category.Id, category.Name, category.Slug };
            await UpsertIdentityAsync(connection, transaction, "dbo.Categories", args,
                "UPDATE dbo.Categories SET Name=@Name, Slug=@Slug, IsActive=1 WHERE CategoryId=@Id",
                """
                INSERT dbo.Categories (CategoryId, Name, Slug, IsActive)
                VALUES (@Id, @Name, @Slug, 1)
                """);
        }
    }

    private async Task SaveProductsAsync(SqlConnection connection, SqlTransaction transaction, IEnumerable<Product> products)
    {
        foreach (var product in products)
        {
            var args = new
            {
                product.Id, product.ArtistId, product.CategoryId, product.Name,
                product.Description, BasePrice = product.Price,
                Slug = $"api-{product.Id}-{Slugify(product.Name)}",
                Status = product.Status == "active" ? "Active" : "Hidden",
            };
            await UpsertIdentityAsync(connection, transaction, "dbo.Products", args,
                """
                UPDATE dbo.Products SET ArtistId=@ArtistId, CategoryId=@CategoryId, Name=@Name,
                    Description=@Description, BasePrice=@BasePrice, Status=@Status,
                    UpdatedAt=SYSUTCDATETIME()
                WHERE ProductId=@Id
                """,
                """
                INSERT dbo.Products (ProductId, ArtistId, CategoryId, Name, Slug, Description, BasePrice, Status)
                VALUES (@Id, @ArtistId, @CategoryId, @Name, @Slug, @Description, @BasePrice, @Status)
                """);

            foreach (var variant in product.Variants)
            {
                var variantArgs = new
                {
                    variant.Id, ProductId = product.Id, variant.Sku,
                    DisplayName = variant.Name, StockQuantity = variant.Stock,
                };
                await UpsertIdentityAsync(connection, transaction, "dbo.ProductVariants", variantArgs,
                    """
                    UPDATE dbo.ProductVariants SET ProductId=@ProductId, Sku=@Sku,
                        DisplayName=@DisplayName, StockQuantity=@StockQuantity, IsActive=1
                    WHERE VariantId=@Id
                    """,
                    """
                    INSERT dbo.ProductVariants (VariantId, ProductId, Sku, DisplayName, StockQuantity)
                    VALUES (@Id, @ProductId, @Sku, @DisplayName, @StockQuantity)
                    """);
            }
            await DeleteMissingAsync(connection, transaction, "dbo.ProductVariants", "VariantId",
                product.Variants.Select(variant => variant.Id), "ProductId", product.Id, activeOnly: true);

            await connection.ExecuteAsync("DELETE FROM dbo.ProductImages WHERE ProductId=@ProductId",
                new { ProductId = product.Id }, transaction);
            var productImages = product.Images.Where(image => !string.IsNullOrWhiteSpace(image)).ToList();
            if (productImages.Count == 0 && !string.IsNullOrWhiteSpace(product.Image))
                productImages.Add(product.Image);
            for (var index = 0; index < productImages.Count; index++)
                await connection.ExecuteAsync(
                    """
                    INSERT dbo.ProductImages (ProductId, ImageUrl, IsPrimary, SortOrder)
                    VALUES (@ProductId, @ImageUrl, @IsPrimary, @SortOrder)
                    """,
                    new
                    {
                        ProductId = product.Id,
                        ImageUrl = productImages[index],
                        IsPrimary = index == 0,
                        SortOrder = index,
                    }, transaction);
        }
    }

    private async Task SaveCommunitiesAsync(SqlConnection connection, SqlTransaction transaction, IEnumerable<Community> communities)
    {
        foreach (var community in communities)
        {
            var args = new
            {
                community.Id, community.ArtistId, community.Name, community.Description,
                AvatarUrl = community.Avatar, CoverUrl = community.Cover,
            };
            await UpsertIdentityAsync(connection, transaction, "dbo.Communities", args,
                """
                UPDATE dbo.Communities SET ArtistId=@ArtistId, Name=@Name, Description=@Description,
                    AvatarUrl=@AvatarUrl, CoverUrl=@CoverUrl
                WHERE CommunityId=@Id
                """,
                """
                INSERT dbo.Communities (CommunityId, ArtistId, Name, Description, AvatarUrl, CoverUrl)
                VALUES (@Id, @ArtistId, @Name, @Description, @AvatarUrl, @CoverUrl)
                """);
        }
    }

    private static async Task SaveCommunityMembersAsync(
        SqlConnection connection, SqlTransaction transaction, IEnumerable<CommunityMember> members)
    {
        await connection.ExecuteAsync("DELETE FROM dbo.CommunityMembers", transaction: transaction);
        foreach (var member in members)
            await connection.ExecuteAsync(
                "INSERT dbo.CommunityMembers (CommunityId, UserId) VALUES (@CommunityId, @UserId)",
                new { member.CommunityId, member.UserId }, transaction);
    }

    private static async Task SaveResetTokensAsync(
        SqlConnection connection, SqlTransaction transaction, IEnumerable<PasswordResetToken> tokens)
    {
        await connection.ExecuteAsync("DELETE FROM dbo.PasswordResetTokens", transaction: transaction);
        foreach (var token in tokens)
        {
            await connection.ExecuteAsync(
                """
                INSERT dbo.PasswordResetTokens (UserId, TokenHash, ExpiresAt, UsedAt)
                VALUES (@UserId, @TokenHash, @ExpiresAt, @UsedAt)
                """,
                new { token.UserId, token.TokenHash, token.ExpiresAt, token.UsedAt }, transaction);
        }
    }

    private static async Task SaveCartsAsync(
        SqlConnection connection, SqlTransaction transaction, IReadOnlyDictionary<int, List<CartItem>> carts)
    {
        await connection.ExecuteAsync("DELETE FROM dbo.CartItems", transaction: transaction);
        await connection.ExecuteAsync("DELETE FROM dbo.Carts", transaction: transaction);
        foreach (var (userId, items) in carts.Where(entry => entry.Value.Count > 0))
        {
            var cartId = await connection.QuerySingleAsync<int>(
                """
                INSERT dbo.Carts (UserId) VALUES (@UserId);
                SELECT CAST(SCOPE_IDENTITY() AS INT);
                """, new { UserId = userId }, transaction);
            foreach (var item in items)
                await connection.ExecuteAsync(
                    "INSERT dbo.CartItems (CartId, VariantId, Quantity) VALUES (@CartId, @VariantId, @Quantity)",
                    new { CartId = cartId, item.VariantId, item.Quantity }, transaction);
        }
    }

    private static async Task SaveOrdersAsync(SqlConnection connection, SqlTransaction transaction, IEnumerable<Order> orders)
    {
        foreach (var order in orders)
        {
            var args = new
            {
                order.Id, order.Code, order.UserId, order.ReceiverName, order.ReceiverPhone,
                order.ShippingAddress, order.Note, order.ShippingFee, order.TotalAmount,
                order.Status, order.CreatedAt,
            };
            await connection.ExecuteAsync(
                """
                UPDATE dbo.Orders SET OrderCode=@Code, UserId=@UserId, ReceiverName=@ReceiverName,
                    ReceiverPhone=@ReceiverPhone, ShippingAddress=@ShippingAddress, Note=@Note,
                    ShippingFee=@ShippingFee, TotalAmount=@TotalAmount, OrderStatus=@Status,
                    UpdatedAt=SYSUTCDATETIME()
                WHERE OrderId=@Id
                """, args, transaction);

            if (!await ExistsAsync(connection, transaction, "dbo.Orders", "OrderId", order.Id))
            {
                await connection.ExecuteAsync("SET IDENTITY_INSERT dbo.Orders ON", transaction: transaction);
                try
                {
                    await connection.ExecuteAsync(
                        """
                        INSERT dbo.Orders
                            (OrderId, OrderCode, UserId, ShippingMethodId, ReceiverName,
                             ReceiverPhone, ShippingAddress, Note, DiscountAmount,
                             ShippingFee, TotalAmount, OrderStatus, CreatedAt)
                        VALUES
                            (@Id, @Code, @UserId,
                             (SELECT ShippingMethodId FROM dbo.ShippingMethods WHERE Code='STANDARD'),
                             @ReceiverName, @ReceiverPhone, @ShippingAddress, @Note, 0,
                             @ShippingFee, @TotalAmount, @Status, @CreatedAt)
                        """, args, transaction);
                }
                finally
                {
                    await connection.ExecuteAsync("SET IDENTITY_INSERT dbo.Orders OFF", transaction: transaction);
                }
            }

            foreach (var item in order.Items)
            {
                var itemArgs = new
                {
                    OrderId = order.Id, item.VariantId, item.ProductName,
                    item.Sku, UnitPrice = (decimal)item.UnitPrice, item.Quantity,
                };
                await connection.ExecuteAsync(
                    """
                    UPDATE dbo.OrderItems SET ProductName=@ProductName, Sku=@Sku,
                        UnitPrice=@UnitPrice, Quantity=@Quantity
                    WHERE OrderId=@OrderId AND VariantId=@VariantId;
                    IF @@ROWCOUNT = 0
                        INSERT dbo.OrderItems (OrderId, VariantId, ProductName, Sku, UnitPrice, Quantity)
                        VALUES (@OrderId, @VariantId, @ProductName, @Sku, @UnitPrice, @Quantity);
                    """, itemArgs, transaction);
            }

            await connection.ExecuteAsync(
                """
                IF NOT EXISTS (SELECT 1 FROM dbo.OrderStatusHistory WHERE OrderId=@OrderId AND Status=@Status)
                    INSERT dbo.OrderStatusHistory (OrderId, Status, ChangedBy, Note)
                    VALUES (@OrderId, @Status, NULL, N'API state synchronization');
                """, new { OrderId = order.Id, order.Status }, transaction);
        }
    }

    private static async Task UpsertIdentityAsync(
        SqlConnection connection, SqlTransaction transaction, string table, object args, string updateSql, string insertSql)
    {
        if (await connection.ExecuteAsync(updateSql, args, transaction) > 0) return;

        await connection.ExecuteAsync($"SET IDENTITY_INSERT {table} ON", transaction: transaction);
        try
        {
            await connection.ExecuteAsync(insertSql, args, transaction);
        }
        finally
        {
            await connection.ExecuteAsync($"SET IDENTITY_INSERT {table} OFF", transaction: transaction);
        }
    }

    private static async Task<bool> ExistsAsync(
        SqlConnection connection, SqlTransaction transaction, string table, string keyColumn, int id) =>
        await connection.ExecuteScalarAsync<int>(
            $"SELECT COUNT(1) FROM {table} WHERE {keyColumn}=@Id", new { Id = id }, transaction) > 0;

    private static Task<int> DeleteMissingAsync(
        SqlConnection connection, SqlTransaction transaction, string table, string keyColumn, IEnumerable<int> ids,
        string? scopeColumn = null, int? scopeId = null, bool activeOnly = false)
    {
        var values = string.Join(",", ids.Distinct());
        var condition = values.Length == 0 ? "1=1" : $"{keyColumn} NOT IN ({values})";
        var scope = scopeColumn is null ? "" : $" AND {scopeColumn}=@ScopeId";
        var active = activeOnly ? " AND IsActive=1" : "";
        return connection.ExecuteAsync(
            $"DELETE FROM {table} WHERE {condition}{scope}{active}",
            scopeColumn is null ? null : new { ScopeId = scopeId },
            transaction);
    }

    private static string ToDatabaseCase(string value) =>
        string.IsNullOrEmpty(value) ? value : char.ToUpperInvariant(value[0]) + value[1..];

    private static string Slugify(string value) =>
        System.Text.RegularExpressions.Regex.Replace(value.Trim().ToLowerInvariant(), "[^a-z0-9]+", "-").Trim('-');

    private sealed class ArtistRow
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        public string Slug { get; set; } = "";
        public string Name { get; set; } = "";
        public string? ProfileDataJson { get; set; }
        public string Genre { get; set; } = "";
        public string Description { get; set; } = "";
        public string Cover { get; set; } = "";
        public string Avatar { get; set; } = "";
        public string Status { get; set; } = "";
        public string? DataJson { get; set; }
    }

    private sealed class ArtistMetadataRow
    {
        public int ArtistId { get; set; }
        public string DataJson { get; set; } = "";
    }

    private sealed class ProductRow
    {
        public int Id { get; set; }
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public int Price { get; set; }
        public int ArtistId { get; set; }
        public int CategoryId { get; set; }
        public string Status { get; set; } = "";
    }

    private sealed class ProductImageRow
    {
        public int ProductId { get; set; }
        public string ImageUrl { get; set; } = "";
        public bool IsPrimary { get; set; }
        public int SortOrder { get; set; }
    }

    private sealed class VariantRow
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string Sku { get; set; } = "";
        public string Name { get; set; } = "";
        public int Stock { get; set; }
    }

    private sealed class CartRow
    {
        public int UserId { get; set; }
        public int VariantId { get; set; }
        public int Quantity { get; set; }
    }

    private sealed class OrderItemRow
    {
        public int OrderId { get; set; }
        public int VariantId { get; set; }
        public string ProductName { get; set; } = "";
        public string Sku { get; set; } = "";
        public int UnitPrice { get; set; }
        public int Quantity { get; set; }
    }

    private sealed class ResetTokenRow
    {
        public int UserId { get; set; }
        public string TokenHash { get; set; } = "";
        public DateTime ExpiresAt { get; set; }
        public DateTime? UsedAt { get; set; }
    }
}
