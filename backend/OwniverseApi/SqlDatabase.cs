using System.Text.Json;
using System.Text.Json.Nodes;
using Dapper;
using Npgsql;

sealed class SqlDatabase(string connectionString)
{
    private readonly SemaphoreSlim saveLock = new(1, 1);
    private readonly JsonSerializerOptions jsonOptions = new(JsonSerializerDefaults.Web);

    public async Task CheckConnectionAsync()
    {
        await using var connection = new NpgsqlConnection(connectionString);
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
        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();

        users.Clear();
        users.AddRange(await connection.QueryAsync<User>(
            """
            SELECT "userid" AS Id, "fullname", "email", "passwordhash" AS Password,
                   COALESCE("phone", '') AS Phone, LOWER("role") AS Role,
                   LOWER("status") AS Status, "createdat"
            FROM public.users
            """));

        var fallbackArtists = SeedData.CreateArtists().ToDictionary(a => a.Slug, StringComparer.OrdinalIgnoreCase);
        var metadata = (await connection.QueryAsync<ArtistMetadataRow>(
            "SELECT \"artistid\", \"datajson\" FROM public.artistapidata")).ToDictionary(row => row.ArtistId);
        var artistRows = await connection.QueryAsync<ArtistRow>(
            """
            SELECT a."artistid" AS Id, a."userid", a."slug", a."name", a."profiledatajson",
                   COALESCE(a."style", '') AS Genre, COALESCE(a."bio", '') AS Description,
                   COALESCE(a."coverurl", '') AS Cover, COALESCE(a."avatarurl", '') AS Avatar,
                   LOWER(a."status") AS Status, d."datajson"
            FROM public.artists a
            LEFT JOIN public.artistapidata d ON d."artistid" = a."artistid"
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
            "SELECT \"categoryid\" AS Id, \"slug\", \"name\" FROM public.categories WHERE \"isactive\" = true"));

        var productRows = await connection.QueryAsync<ProductRow>(
            """
            SELECT "productid" AS Id, "name", COALESCE("description", '') AS Description,
                   CAST("baseprice" AS INT) AS Price, "artistid", "categoryid",
                   LOWER("status") AS Status
            FROM public.products
            """);
        var productList = productRows.ToList();
        var images = (await connection.QueryAsync<ProductImageRow>(
            """
            SELECT "productid", "imageurl", "isprimary", "sortorder"
            FROM public.productimages
            ORDER BY "productid", "isprimary" DESC, "sortorder"
            """)).GroupBy(row => row.ProductId).ToDictionary(group => group.Key, group => group.ToList());
        var variants = (await connection.QueryAsync<VariantRow>(
            """
            SELECT "variantid" AS Id, "productid", "sku", "displayname" AS Name,
                   "stockquantity" AS Stock
            FROM public.productvariants
            WHERE "isactive" = true
            ORDER BY "variantid"
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
            SELECT "communityid" AS Id, "artistid", "name",
                   COALESCE("description", '') AS Description,
                   COALESCE("avatarurl", '') AS Avatar,
                   COALESCE("coverurl", '') AS Cover
            FROM public.communities
            """);
        communities.Clear();
        communities.AddRange(communityRows);

        var memberRows = await connection.QueryAsync<CommunityMember>(
            "SELECT \"communityid\", \"userid\" FROM public.communitymembers");
        communityMembers.Clear();
        communityMembers.AddRange(memberRows);

        var tokenRows = await connection.QueryAsync<ResetTokenRow>(
            """
            SELECT "userid", "tokenhash", "expiresat", "usedat"
            FROM public.passwordresettokens
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
            SELECT c."userid", ci."variantid", ci."quantity"
            FROM public.carts c
            JOIN public.cartitems ci ON ci."cartid" = c."cartid"
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
            SELECT "orderid" AS Id, "ordercode" AS Code, "userid", "receivername",
                   "receiverphone", "shippingaddress", COALESCE("note", '') AS Note,
                   "shippingfee", "totalamount", "orderstatus" AS Status, "createdat"
            FROM public.orders
            """)).ToList();
        var orderItems = (await connection.QueryAsync<OrderItemRow>(
            """
            SELECT "orderid", "variantid", "productname", "sku",
                   CAST("unitprice" AS INT) AS UnitPrice, "quantity"
            FROM public.orderitems
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
        bool lockAcquired = false;
        try
        {
            lockAcquired = await saveLock.WaitAsync(TimeSpan.FromSeconds(30));
            if (!lockAcquired)
                throw new TimeoutException("Could not acquire database save lock within 30 seconds.");

            await using var connection = new NpgsqlConnection(connectionString);
            await connection.OpenAsync();
            await using var transaction = await connection.BeginTransactionAsync();
            try
            {
                await SaveUsersAsync(connection, transaction, users);

                var saveableArtists = artists.Where(a => a.UserId is not null).ToList();
                await SaveArtistsAsync(connection, transaction, saveableArtists);

                await SaveCategoriesAsync(connection, transaction, categories);

                var saveableProducts = products.Where(p =>
                    artists.Any(a => a.Id == p.ArtistId && a.UserId is not null) &&
                    categories.Any(c => c.Id == p.CategoryId)).ToList();
                await SaveProductsAsync(connection, transaction, saveableProducts);

                var saveableCommunities = communities.Where(c =>
                    artists.Any(a => a.Id == c.ArtistId && a.UserId is not null)).ToList();
                await SaveCommunitiesAsync(connection, transaction, saveableCommunities);

                await SaveResetTokensAsync(connection, transaction, passwordResetTokens);
                await SaveCartsAsync(connection, transaction, carts);
                await SaveOrdersAsync(connection, transaction, orders);
                await DeleteMissingAsync(connection, transaction, "communities", "\"communityid\"", communities.Select(item => item.Id));
                await DeleteMissingAsync(connection, transaction, "products", "\"productid\"", products.Select(item => item.Id));
                await DeleteMissingAsync(connection, transaction, "categories", "\"categoryid\"",
                    categories.Select(item => item.Id), activeOnly: true);
                await DeleteMissingAsync(connection, transaction, "artists", "\"artistid\"", artists.Select(item => item.Id));
                await DeleteMissingAsync(connection, transaction, "users", "\"userid\"", users.Select(item => item.Id));
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"[SqlDatabase] SaveAsync failed and rolled back: {ex}");
                throw;
            }
        }
        finally
        {
            if (lockAcquired)
                saveLock.Release();
        }
    }

    private async Task SaveUsersAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, IEnumerable<User> users)
    {
        foreach (var user in users)
        {
            var args = new
            {
                user.Id, user.FullName, user.Email, user.Password, user.Phone, user.Address,
                Role = ToDatabaseCase(user.Role), Status = ToDatabaseCase(user.Status), user.CreatedAt,
            };
            await UpsertIdentityAsync(connection, transaction, "public.users", args,
                """
                UPDATE public.users SET "fullname"=@FullName, "email"=@Email, "passwordhash"=@Password,
                    "phone"=@Phone, "address"=@Address, "role"=@Role, "status"=@Status,
                    "updatedat"=NOW() AT TIME ZONE 'UTC'
                WHERE "userid"=@Id
                """,
                """
                INSERT INTO public.users ("userid", "fullname", "email", "passwordhash", "phone", "address", "role", "status", "createdat")
                VALUES (@Id, @FullName, @Email, @Password, @Phone, @Address, @Role, @Status, @CreatedAt)
                """);
        }
    }

    private async Task SaveArtistsAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, IEnumerable<Artist> artists)
    {
        foreach (var artist in artists)
        {
            if (artist.UserId is null) continue; // Nghệ sĩ chưa liên kết tài khoản không lưu vào DB (cột userid là NOT NULL + UNIQUE + FK)
            var args = new
            {
                artist.Id, artist.UserId, artist.Name, artist.Slug, Bio = artist.Description,
                Style = artist.Genre, AvatarUrl = artist.Avatar, CoverUrl = artist.Cover,
                Status = artist.Status == "active" ? "Active" : "Inactive",
            };
            await connection.ExecuteAsync(
                """
                UPDATE public.artists SET "userid"=@UserId, "name"=@Name, "slug"=@Slug, "bio"=@Bio,
                    "style"=@Style, "avatarurl"=@AvatarUrl, "coverurl"=@CoverUrl, "status"=@Status,
                    "updatedat"=NOW() AT TIME ZONE 'UTC'
                WHERE "artistid"=@Id
                """, args, transaction);
            if (!await ExistsAsync(connection, transaction, "public.artists", "\"artistid\"", artist.Id))
                await UpsertIdentityAsync(connection, transaction, "public.artists", args, "SELECT 0 WHERE 1=0",
                    """
                    INSERT INTO public.artists ("artistid", "userid", "name", "slug", "bio", "style", "avatarurl", "coverurl", "status")
                    VALUES (@Id, @UserId, @Name, @Slug, @Bio, @Style, @AvatarUrl, @CoverUrl, @Status)
                    """);

            await connection.ExecuteAsync(
                """
                INSERT INTO public.artistapidata ("artistid", "datajson")
                VALUES (@ArtistId, @DataJson)
                ON CONFLICT ("artistid") DO UPDATE SET "datajson" = EXCLUDED."datajson";
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

    private async Task SaveCategoriesAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, IEnumerable<Category> categories)
    {
        foreach (var category in categories)
        {
            var args = new { category.Id, category.Name, category.Slug };
            await UpsertIdentityAsync(connection, transaction, "public.categories", args,
                "UPDATE public.categories SET \"name\"=@Name, \"slug\"=@Slug, \"isactive\"=true WHERE \"categoryid\"=@Id",
                """
                INSERT INTO public.categories ("categoryid", "name", "slug", "isactive")
                VALUES (@Id, @Name, @Slug, true)
                """);
        }
    }

    private async Task SaveProductsAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, IEnumerable<Product> products)
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
            await UpsertIdentityAsync(connection, transaction, "public.products", args,
                """
                UPDATE public.products SET "artistid"=@ArtistId, "categoryid"=@CategoryId, "name"=@Name,
                    "description"=@Description, "baseprice"=@BasePrice, "status"=@Status,
                    "updatedat"=NOW() AT TIME ZONE 'UTC'
                WHERE "productid"=@Id
                """,
                """
                INSERT INTO public.products ("productid", "artistid", "categoryid", "name", "slug", "description", "baseprice", "status")
                VALUES (@Id, @ArtistId, @CategoryId, @Name, @Slug, @Description, @BasePrice, @Status)
                """);

            foreach (var variant in product.Variants)
            {
                var variantArgs = new
                {
                    variant.Id, ProductId = product.Id, variant.Sku,
                    DisplayName = variant.Name, StockQuantity = variant.Stock,
                };
                await UpsertIdentityAsync(connection, transaction, "public.productvariants", variantArgs,
                    """
                    UPDATE public.productvariants SET "productid"=@ProductId, "sku"=@Sku,
                        "displayname"=@DisplayName, "stockquantity"=@StockQuantity, "isactive"=true
                    WHERE "variantid"=@Id
                    """,
                    """
                    INSERT INTO public.productvariants ("variantid", "productid", "sku", "displayname", "stockquantity")
                    VALUES (@Id, @ProductId, @Sku, @DisplayName, @StockQuantity)
                    """);
            }
            await DeleteMissingAsync(connection, transaction, "public.productvariants", "\"variantid\"",
                product.Variants.Select(variant => variant.Id), "\"productid\"", product.Id, activeOnly: true);

            await connection.ExecuteAsync("DELETE FROM public.productimages WHERE \"productid\"=@ProductId",
                new { ProductId = product.Id }, transaction);
            var productImages = product.Images.Where(image => !string.IsNullOrWhiteSpace(image)).ToList();
            if (productImages.Count == 0 && !string.IsNullOrWhiteSpace(product.Image))
                productImages.Add(product.Image);
            for (var index = 0; index < productImages.Count; index++)
                await connection.ExecuteAsync(
                    """
                    INSERT INTO public.productimages ("productid", "imageurl", "isprimary", "sortorder")
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

    private async Task SaveCommunitiesAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, IEnumerable<Community> communities)
    {
        foreach (var community in communities)
        {
            var args = new
            {
                community.Id, community.ArtistId, community.Name, community.Description,
                AvatarUrl = community.Avatar, CoverUrl = community.Cover,
            };
            await UpsertIdentityAsync(connection, transaction, "public.communities", args,
                """
                UPDATE public.communities SET "artistid"=@ArtistId, "name"=@Name, "description"=@Description,
                    "avatarurl"=@AvatarUrl, "coverurl"=@CoverUrl
                WHERE "communityid"=@Id
                """,
                """
                INSERT INTO public.communities ("communityid", "artistid", "name", "description", "avatarurl", "coverurl")
                VALUES (@Id, @ArtistId, @Name, @Description, @AvatarUrl, @CoverUrl)
                """);
        }
    }

    private static async Task SaveResetTokensAsync(
        NpgsqlConnection connection, NpgsqlTransaction transaction, IEnumerable<PasswordResetToken> tokens)
    {
        await connection.ExecuteAsync("DELETE FROM public.passwordresettokens", transaction: transaction);
        foreach (var token in tokens)
        {
            await connection.ExecuteAsync(
                """
                INSERT INTO public.passwordresettokens ("userid", "tokenhash", "expiresat", "usedat")
                VALUES (@UserId, @TokenHash, @ExpiresAt, @UsedAt)
                """,
                new { token.UserId, token.TokenHash, token.ExpiresAt, token.UsedAt }, transaction);
        }
    }

    private static async Task SaveCartsAsync(
        NpgsqlConnection connection, NpgsqlTransaction transaction, IReadOnlyDictionary<int, List<CartItem>> carts)
    {
        await connection.ExecuteAsync("DELETE FROM public.cartitems", transaction: transaction);
        await connection.ExecuteAsync("DELETE FROM public.carts", transaction: transaction);
        foreach (var (userId, items) in carts.Where(entry => entry.Value.Count > 0))
        {
            var cartId = await connection.QuerySingleAsync<int>(
                """
                INSERT INTO public.carts ("userid") VALUES (@UserId)
                RETURNING "cartid";
                """, new { UserId = userId }, transaction);
            foreach (var item in items)
                await connection.ExecuteAsync(
                    "INSERT INTO public.cartitems (\"cartid\", \"variantid\", \"quantity\") VALUES (@CartId, @VariantId, @Quantity)",
                    new { CartId = cartId, item.VariantId, item.Quantity }, transaction);
        }
    }

    private static async Task SaveOrdersAsync(NpgsqlConnection connection, NpgsqlTransaction transaction, IEnumerable<Order> orders)
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
                UPDATE public.orders SET "ordercode"=@Code, "userid"=@UserId, "receivername"=@ReceiverName,
                    "receiverphone"=@ReceiverPhone, "shippingaddress"=@ShippingAddress, "note"=@Note,
                    "shippingfee"=@ShippingFee, "totalamount"=@TotalAmount, "orderstatus"=@Status,
                    "updatedat"=NOW() AT TIME ZONE 'UTC'
                WHERE "orderid"=@Id
                """, args, transaction);

            if (!await ExistsAsync(connection, transaction, "public.orders", "\"orderid\"", order.Id))
            {
                await connection.ExecuteAsync(
                    """
                    INSERT INTO public.orders
                        ("orderid", "ordercode", "userid", "shippingmethodid", "receivername",
                         "receiverphone", "shippingaddress", "note", "discountamount",
                         "shippingfee", "totalamount", "orderstatus", "createdat")
                    VALUES
                        (@Id, @Code, @UserId,
                         (SELECT "shippingmethodid" FROM public.shippingmethods WHERE "code"='STANDARD'),
                         @ReceiverName, @ReceiverPhone, @ShippingAddress, @Note, 0,
                         @ShippingFee, @TotalAmount, @Status, @CreatedAt)
                    """, args, transaction);
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
                    INSERT INTO public.orderitems ("orderid", "variantid", "productname", "sku", "unitprice", "quantity")
                    VALUES (@OrderId, @VariantId, @ProductName, @Sku, @UnitPrice, @Quantity)
                    ON CONFLICT ("orderid", "variantid") DO UPDATE SET
                        "productname" = EXCLUDED."productname",
                        "sku" = EXCLUDED."sku",
                        "unitprice" = EXCLUDED."unitprice",
                        "quantity" = EXCLUDED."quantity";
                    """, itemArgs, transaction);
            }

            await connection.ExecuteAsync(
                """
                INSERT INTO public.orderstatushistory ("orderid", "status", "changedby", "note")
                SELECT @OrderId, @Status, NULL, 'API state synchronization'
                WHERE NOT EXISTS (SELECT 1 FROM public.orderstatushistory WHERE "orderid"=@OrderId AND "status"=@Status);
                """, new { OrderId = order.Id, order.Status }, transaction);
        }
    }

    private static async Task UpsertIdentityAsync(
        NpgsqlConnection connection, NpgsqlTransaction transaction, string table, object args, string updateSql, string insertSql)
    {
        if (await connection.ExecuteAsync(updateSql, args, transaction) > 0) return;

        await connection.ExecuteAsync(insertSql, args, transaction);
    }

    private static async Task<bool> ExistsAsync(
        NpgsqlConnection connection, NpgsqlTransaction transaction, string table, string keyColumn, int id) =>
        await connection.ExecuteScalarAsync<int>(
            $"SELECT COUNT(1) FROM {table} WHERE {keyColumn}=@Id", new { Id = id }, transaction) > 0;

    private static Task<int> DeleteMissingAsync(
        NpgsqlConnection connection, NpgsqlTransaction transaction, string table, string keyColumn, IEnumerable<int> ids,
        string? scopeColumn = null, int? scopeId = null, bool activeOnly = false)
    {
        var values = string.Join(",", ids.Distinct());
        var condition = values.Length == 0 ? "1=1" : $"{keyColumn} NOT IN ({values})";
        var scope = scopeColumn is null ? "" : $" AND {scopeColumn}=@ScopeId";
        var active = activeOnly ? " AND \"isactive\"=true" : "";
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
