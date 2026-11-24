using Dapper;
using Microsoft.Data.SqlClient;

sealed class CommunityRepository(string connectionString)
{
    public async Task<List<object>> GetCommunitiesAsync(int? userId, CancellationToken ct)
    {
        const string sql = """
            SELECT c.CommunityId AS Id, c.ArtistId, c.Name, c.Description,
                   c.AvatarUrl AS Avatar, c.CoverUrl AS Cover,
                   COUNT(DISTINCT cm.UserId) AS MemberCount,
                   CAST(CASE WHEN @UserId IS NOT NULL AND EXISTS
                       (SELECT 1 FROM dbo.CommunityMembers mine WHERE mine.CommunityId=c.CommunityId AND mine.UserId=@UserId)
                       THEN 1 ELSE 0 END AS bit) AS IsMember
            FROM dbo.Communities c
            INNER JOIN dbo.Artists a ON a.ArtistId=c.ArtistId AND a.Status='Active'
            LEFT JOIN dbo.CommunityMembers cm ON cm.CommunityId=c.CommunityId
            GROUP BY c.CommunityId,c.ArtistId,c.Name,c.Description,c.AvatarUrl,c.CoverUrl
            ORDER BY c.CommunityId;
            """;
        await using var db = new SqlConnection(connectionString);
        var rows = await db.QueryAsync(sql, new { UserId = userId });
        return rows.Select(row => (object)row).ToList();
    }

    public async Task<object?> GetCommunityAsync(int id, int? userId, CancellationToken ct)
    {
        const string sql = """
            SELECT c.CommunityId AS Id,c.ArtistId,c.Name,c.Description,c.AvatarUrl AS Avatar,c.CoverUrl AS Cover,
                   (SELECT COUNT(1) FROM dbo.CommunityMembers cm WHERE cm.CommunityId=c.CommunityId) AS MemberCount,
                   CAST(CASE WHEN @UserId IS NOT NULL AND EXISTS
                       (SELECT 1 FROM dbo.CommunityMembers mine WHERE mine.CommunityId=c.CommunityId AND mine.UserId=@UserId)
                       THEN 1 ELSE 0 END AS bit) AS IsMember
            FROM dbo.Communities c INNER JOIN dbo.Artists a ON a.ArtistId=c.ArtistId AND a.Status='Active'
            WHERE c.CommunityId=@Id;
            """;
        await using var db = new SqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync(sql, new { Id = id, UserId = userId });
    }

    public async Task<List<object>> GetMembersAsync(int communityId, CancellationToken ct)
    {
        const string sql = """
            SELECT u.UserId AS Id,u.FullName,u.Role,cm.JoinedAt
            FROM dbo.CommunityMembers cm JOIN dbo.Users u ON u.UserId=cm.UserId
            WHERE cm.CommunityId=@CommunityId ORDER BY cm.JoinedAt DESC;
            """;
        await using var db = new SqlConnection(connectionString);
        return (await db.QueryAsync(sql, new { CommunityId = communityId })).Select(row => (object)row).ToList();
    }

    public async Task<List<CommunityPostView>> GetPostsAsync(int communityId, string? section, int? userId, CancellationToken ct)
    {
        const string sql = """
            SELECT p.PostId,p.CommunityId,p.AuthorId,u.FullName AS AuthorName,p.Section,p.Content,p.IsPinned,p.Status,
                   p.CreatedAt,p.UpdatedAt,
                   (SELECT COUNT(1) FROM dbo.PostLikes l WHERE l.PostId=p.PostId) AS LikeCount,
                   (SELECT COUNT(1) FROM dbo.Comments c WHERE c.PostId=p.PostId AND c.Status='Visible') AS CommentCount,
                   CAST(CASE WHEN @UserId IS NOT NULL AND EXISTS
                       (SELECT 1 FROM dbo.PostLikes mine WHERE mine.PostId=p.PostId AND mine.UserId=@UserId)
                       THEN 1 ELSE 0 END AS bit) AS LikedByMe
            FROM dbo.Posts p JOIN dbo.Users u ON u.UserId=p.AuthorId
            WHERE p.CommunityId=@CommunityId AND p.Status='Visible' AND (@Section IS NULL OR p.Section=@Section)
            ORDER BY p.IsPinned DESC,p.CreatedAt DESC,p.PostId DESC;
            """;
        await using var db = new SqlConnection(connectionString);
        var posts = (await db.QueryAsync<CommunityPostView>(sql, new { CommunityId = communityId, Section = section, UserId = userId })).ToList();
        if (posts.Count == 0) return posts;
        var mediaRows = await db.QueryAsync<dynamic>(
            "SELECT PostId,MediaId,MediaType,MediaUrl,SortOrder FROM dbo.PostMedia WHERE PostId IN @PostIds ORDER BY SortOrder,MediaId",
            new { PostIds = posts.Select(post => post.PostId).ToArray() });
        foreach (var row in mediaRows)
        {
            var post = posts.FirstOrDefault(item => item.PostId == (int)row.PostId);
            post?.Media.Add(new CommunityMediaView((int)row.MediaId, (string)row.MediaType, (string)row.MediaUrl, (int)row.SortOrder));
        }
        return posts;
    }

    public async Task<bool> IsCommunityActiveAsync(int communityId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.ExecuteScalarAsync<int>("""
            SELECT COUNT(1) FROM dbo.Communities c JOIN dbo.Artists a ON a.ArtistId=c.ArtistId
            WHERE c.CommunityId=@CommunityId AND a.Status='Active';
            """, new { CommunityId = communityId }) > 0;
    }

    public async Task<int?> GetMemberArtistOwnerAsync(int communityId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync<int?>("""
            SELECT a.UserId FROM dbo.Communities c JOIN dbo.Artists a ON a.ArtistId=c.ArtistId
            WHERE c.CommunityId=@CommunityId;
            """, new { CommunityId = communityId });
    }

    public async Task<bool> IsMemberAsync(int communityId, int userId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM dbo.CommunityMembers WHERE CommunityId=@CommunityId AND UserId=@UserId",
            new { CommunityId = communityId, UserId = userId }) > 0;
    }

    public async Task<List<int>> GetFollowingArtistIdsAsync(int userId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return (await db.QueryAsync<int>("""
            SELECT c.ArtistId FROM dbo.CommunityMembers cm
            JOIN dbo.Communities c ON c.CommunityId=cm.CommunityId WHERE cm.UserId=@UserId;
            """, new { UserId = userId })).ToList();
    }

    public async Task<int> CreatePostAsync(int communityId, int authorId, string section, string? content,
        IReadOnlyCollection<CommunityMediaRequest> media, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        await db.OpenAsync(ct);
        await using var tx = await db.BeginTransactionAsync(ct);
        var postId = await db.ExecuteScalarAsync<int>("""
            INSERT dbo.Posts(CommunityId,AuthorId,Section,Content) VALUES(@CommunityId,@AuthorId,@Section,@Content);
            SELECT CAST(SCOPE_IDENTITY() AS int);
            """, new { CommunityId = communityId, AuthorId = authorId, Section = section, Content = content }, tx);
        await SaveMediaAsync(db, tx, postId, media);
        await tx.CommitAsync(ct);
        return postId;
    }

    public async Task<(int? CommunityId, int? AuthorId, string? Section, string? Status)> GetPostPermissionAsync(int postId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync<(int?, int?, string?, string?)>(
            "SELECT CommunityId,AuthorId,Section,Status FROM dbo.Posts WHERE PostId=@PostId", new { PostId = postId });
    }

    public async Task<bool> UpdatePostAsync(int postId, string? content, IReadOnlyCollection<CommunityMediaRequest>? media, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        await db.OpenAsync(ct);
        await using var tx = await db.BeginTransactionAsync(ct);
        var changed = await db.ExecuteAsync("UPDATE dbo.Posts SET Content=@Content,UpdatedAt=SYSUTCDATETIME() WHERE PostId=@PostId AND Status='Visible'",
            new { PostId = postId, Content = content }, tx);
        if (changed == 0) return false;
        if (media is not null)
        {
            await db.ExecuteAsync("DELETE FROM dbo.PostMedia WHERE PostId=@PostId", new { PostId = postId }, tx);
            await SaveMediaAsync(db, tx, postId, media);
        }
        await tx.CommitAsync(ct);
        return true;
    }

    public async Task<bool> DeletePostAsync(int postId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.ExecuteAsync("UPDATE dbo.Posts SET Status='Deleted',UpdatedAt=SYSUTCDATETIME() WHERE PostId=@PostId AND Status<>'Deleted'",
            new { PostId = postId }) == 1;
    }

    public async Task<bool> SetLikeAsync(int postId, int userId, bool liked, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        if (liked)
            await db.ExecuteAsync("""
                IF EXISTS(SELECT 1 FROM dbo.Posts WHERE PostId=@PostId AND Status='Visible')
                    IF NOT EXISTS(SELECT 1 FROM dbo.PostLikes WHERE PostId=@PostId AND UserId=@UserId)
                        INSERT dbo.PostLikes(PostId,UserId) VALUES(@PostId,@UserId);
                """, new { PostId = postId, UserId = userId });
        else
            await db.ExecuteAsync("DELETE l FROM dbo.PostLikes l JOIN dbo.Posts p ON p.PostId=l.PostId WHERE l.PostId=@PostId AND l.UserId=@UserId AND p.Status='Visible'",
                new { PostId = postId, UserId = userId });
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM dbo.Posts WHERE PostId=@PostId AND Status='Visible'", new { PostId = postId }) > 0;
    }

    public async Task<List<CommunityCommentView>> GetCommentsAsync(int postId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return (await db.QueryAsync<CommunityCommentView>("""
            SELECT c.CommentId,c.PostId,c.UserId,u.FullName AS AuthorName,c.ParentCommentId,c.Content,c.CreatedAt,c.UpdatedAt
            FROM dbo.Comments c JOIN dbo.Users u ON u.UserId=c.UserId
            WHERE c.PostId=@PostId AND c.Status='Visible' ORDER BY c.CreatedAt,c.CommentId;
            """, new { PostId = postId })).ToList();
    }

    public async Task<int?> CreateCommentAsync(int postId, int userId, int? parentId, string content, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        await db.OpenAsync(ct);
        await using var tx = await db.BeginTransactionAsync(ct);
        if (await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM dbo.Posts WHERE PostId=@PostId AND Status='Visible'", new { PostId = postId }, tx) == 0)
            return null;
        if (parentId is not null && await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM dbo.Comments WHERE CommentId=@ParentId AND PostId=@PostId AND Status='Visible'",
            new { ParentId = parentId, PostId = postId }, tx) == 0) return -1;
        var id = await db.ExecuteScalarAsync<int>("INSERT dbo.Comments(PostId,UserId,ParentCommentId,Content) VALUES(@PostId,@UserId,@ParentId,@Content); SELECT CAST(SCOPE_IDENTITY() AS int);",
            new { PostId = postId, UserId = userId, ParentId = parentId, Content = content }, tx);
        await tx.CommitAsync(ct);
        return id;
    }

    public async Task<(int? UserId, int? PostId, int? CommunityId, string? Status)> GetCommentPermissionAsync(int commentId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync<(int?, int?, int?, string?)>("""
            SELECT c.UserId,c.PostId,p.CommunityId,c.Status FROM dbo.Comments c JOIN dbo.Posts p ON p.PostId=c.PostId WHERE c.CommentId=@CommentId
            """, new { CommentId = commentId });
    }

    public async Task<bool> UpdateCommentAsync(int commentId, string content, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.ExecuteAsync("UPDATE dbo.Comments SET Content=@Content,UpdatedAt=SYSUTCDATETIME() WHERE CommentId=@CommentId AND Status='Visible'",
            new { CommentId = commentId, Content = content }) == 1;
    }

    public async Task<bool> DeleteCommentAsync(int commentId, CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        return await db.ExecuteAsync("UPDATE dbo.Comments SET Status='Deleted',UpdatedAt=SYSUTCDATETIME() WHERE CommentId=@CommentId AND Status<>'Deleted'",
            new { CommentId = commentId }) == 1;
    }

    public async Task<List<object>> GetAdminCommunitiesAsync(CancellationToken ct)
    {
        await using var db = new SqlConnection(connectionString);
        var rows = await db.QueryAsync("""
            SELECT c.CommunityId AS Id,c.ArtistId,c.Name,c.Description,c.AvatarUrl AS Avatar,c.CoverUrl AS Cover,
                   a.Name AS ArtistName,a.Slug AS ArtistSlug,
                   (SELECT COUNT(1) FROM dbo.CommunityMembers cm WHERE cm.CommunityId=c.CommunityId) AS MemberCount,
                   (SELECT COUNT(1) FROM dbo.Posts p WHERE p.CommunityId=c.CommunityId AND p.Status='Visible') AS PostCount
            FROM dbo.Communities c JOIN dbo.Artists a ON a.ArtistId=c.ArtistId ORDER BY c.CommunityId;
            """);
        return rows.Select(row => (object)row).ToList();
    }

    private static async Task SaveMediaAsync(SqlConnection db, System.Data.Common.DbTransaction tx, int postId,
        IEnumerable<CommunityMediaRequest> media)
    {
        var order = 0;
        foreach (var item in media)
            await db.ExecuteAsync("INSERT dbo.PostMedia(PostId,MediaType,MediaUrl,SortOrder) VALUES(@PostId,@MediaType,@MediaUrl,@SortOrder)",
                new { PostId = postId,
                    MediaType = item.MediaType?.Equals("Video", StringComparison.OrdinalIgnoreCase) == true ? "Video" : "Image",
                    MediaUrl = item.MediaUrl?.Trim(), SortOrder = order++ }, tx);
    }
}
