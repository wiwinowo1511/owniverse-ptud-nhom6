using Dapper;
using Npgsql;

sealed class CommunityRepository(string connectionString)
{
    public async Task<List<object>> GetCommunitiesAsync(int? userId, CancellationToken ct)
    {
        const string sql = """
            SELECT c."communityid" AS Id, c."artistid", c."name", c."description",
                   c."avatarurl" AS Avatar, c."coverurl" AS Cover,
                   COUNT(DISTINCT cm."userid") AS MemberCount,
                   CAST(CASE WHEN @UserId IS NOT NULL AND EXISTS
                       (SELECT 1 FROM public.communitymembers mine WHERE mine."communityid"=c."communityid" AND mine."userid"=@UserId)
                       THEN 1 ELSE 0 END AS boolean) AS IsMember
            FROM public.communities c
            INNER JOIN public.artists a ON a."artistid"=c."artistid" AND a."status"='Active'
            LEFT JOIN public.communitymembers cm ON cm."communityid"=c."communityid"
            GROUP BY c."communityid",c."artistid",c."name",c."description",c."avatarurl",c."coverurl"
            ORDER BY c."communityid";
            """;
        await using var db = new NpgsqlConnection(connectionString);
        var rows = await db.QueryAsync(sql, new { UserId = userId });
        return rows.Select(row => (object)row).ToList();
    }

    public async Task<object?> GetCommunityAsync(int id, int? userId, CancellationToken ct)
    {
        const string sql = """
            SELECT c."communityid" AS Id,c."artistid",c."name",c."description",c."avatarurl" AS Avatar,c."coverurl" AS Cover,
                   (SELECT COUNT(1) FROM public.communitymembers cm WHERE cm."communityid"=c."communityid") AS MemberCount,
                   CAST(CASE WHEN @UserId IS NOT NULL AND EXISTS
                       (SELECT 1 FROM public.communitymembers mine WHERE mine."communityid"=c."communityid" AND mine."userid"=@UserId)
                       THEN 1 ELSE 0 END AS boolean) AS IsMember
            FROM public.communities c INNER JOIN public.artists a ON a."artistid"=c."artistid" AND a."status"='Active'
            WHERE c."communityid"=@Id;
            """;
        await using var db = new NpgsqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync(sql, new { Id = id, UserId = userId });
    }

    public async Task<List<object>> GetMembersAsync(int communityId, CancellationToken ct)
    {
        const string sql = """
            SELECT u."userid" AS Id,u."fullname",u."role",cm."joinedat"
            FROM public.communitymembers cm JOIN public.users u ON u."userid"=cm."userid"
            WHERE cm."communityid"=@CommunityId ORDER BY cm."joinedat" DESC;
            """;
        await using var db = new NpgsqlConnection(connectionString);
        return (await db.QueryAsync(sql, new { CommunityId = communityId })).Select(row => (object)row).ToList();
    }

    public async Task<List<CommunityPostView>> GetPostsAsync(int communityId, string? section, int? userId, CancellationToken ct)
    {
        const string sql = """
            SELECT p."postid",p."communityid",p."authorid",u."fullname" AS AuthorName,p."section",p."content",p."ispinned",p."status",
                   p."createdat",p."updatedat",
                   (SELECT COUNT(1) FROM public.postlikes l WHERE l."postid"=p."postid") AS LikeCount,
                   (SELECT COUNT(1) FROM public.comments c WHERE c."postid"=p."postid" AND c."status"='Visible') AS CommentCount,
                   CAST(CASE WHEN @UserId IS NOT NULL AND EXISTS
                       (SELECT 1 FROM public.postlikes mine WHERE mine."postid"=p."postid" AND mine."userid"=@UserId)
                       THEN 1 ELSE 0 END AS boolean) AS LikedByMe
            FROM public.posts p JOIN public.users u ON u."userid"=p."authorid"
            WHERE p."communityid"=@CommunityId AND p."status"='Visible' AND (@Section IS NULL OR p."section"=@Section)
            ORDER BY p."ispinned" DESC,p."createdat" DESC,p."postid" DESC;
            """;
        await using var db = new NpgsqlConnection(connectionString);
        var posts = (await db.QueryAsync<CommunityPostView>(sql, new { CommunityId = communityId, Section = section, UserId = userId })).ToList();
        if (posts.Count == 0) return posts;
        var mediaRows = await db.QueryAsync<dynamic>(
            "SELECT \"postid\",\"mediaid\",\"mediatype\",\"mediaurl\",\"sortorder\" FROM public.postmedia WHERE \"postid\" IN @PostIds ORDER BY \"sortorder\",\"mediaid\"",
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
        await using var db = new NpgsqlConnection(connectionString);
        return await db.ExecuteScalarAsync<int>("""
            SELECT COUNT(1) FROM public.communities c JOIN public.artists a ON a."artistid"=c."artistid"
            WHERE c."communityid"=@CommunityId AND a."status"='Active';
            """, new { CommunityId = communityId }) > 0;
    }

    public async Task<int?> GetMemberArtistOwnerAsync(int communityId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync<int?>("""
            SELECT a."userid" FROM public.communities c JOIN public.artists a ON a."artistid"=c."artistid"
            WHERE c."communityid"=@CommunityId;
            """, new { CommunityId = communityId });
    }

    public async Task<bool> IsMemberAsync(int communityId, int userId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM public.communitymembers WHERE \"communityid\"=@CommunityId AND \"userid\"=@UserId",
            new { CommunityId = communityId, UserId = userId }) > 0;
    }

    public async Task<List<int>> GetFollowingArtistIdsAsync(int userId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return (await db.QueryAsync<int>("""
            SELECT c."artistid" FROM public.communitymembers cm
            JOIN public.communities c ON c."communityid"=cm."communityid" WHERE cm."userid"=@UserId;
            """, new { UserId = userId })).ToList();
    }

    public async Task<int> CreatePostAsync(int communityId, int authorId, string section, string? content,
        IReadOnlyCollection<CommunityMediaRequest> media, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        await db.OpenAsync(ct);
        await using var tx = await db.BeginTransactionAsync(ct);
        var postId = await db.ExecuteScalarAsync<int>("""
            INSERT INTO public.posts("communityid","authorid","section","content") VALUES(@CommunityId,@AuthorId,@Section,@Content)
            RETURNING "postid";
            """, new { CommunityId = communityId, AuthorId = authorId, Section = section, Content = content }, tx);
        await SaveMediaAsync(db, tx, postId, media);
        await tx.CommitAsync(ct);
        return postId;
    }

    public async Task<(int? CommunityId, int? AuthorId, string? Section, string? Status)> GetPostPermissionAsync(int postId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync<(int?, int?, string?, string?)>(
            "SELECT \"communityid\",\"authorid\",\"section\",\"status\" FROM public.posts WHERE \"postid\"=@PostId", new { PostId = postId });
    }

    public async Task<bool> UpdatePostAsync(int postId, string? content, IReadOnlyCollection<CommunityMediaRequest>? media, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        await db.OpenAsync(ct);
        await using var tx = await db.BeginTransactionAsync(ct);
        var changed = await db.ExecuteAsync("UPDATE public.posts SET \"content\"=@Content,\"updatedat\"=NOW() AT TIME ZONE 'UTC' WHERE \"postid\"=@PostId AND \"status\"='Visible'",
            new { PostId = postId, Content = content }, tx);
        if (changed == 0) return false;
        if (media is not null)
        {
            await db.ExecuteAsync("DELETE FROM public.postmedia WHERE \"postid\"=@PostId", new { PostId = postId }, tx);
            await SaveMediaAsync(db, tx, postId, media);
        }
        await tx.CommitAsync(ct);
        return true;
    }

    public async Task<bool> DeletePostAsync(int postId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return await db.ExecuteAsync("UPDATE public.posts SET \"status\"='Deleted',\"updatedat\"=NOW() AT TIME ZONE 'UTC' WHERE \"postid\"=@PostId AND \"status\"<>'Deleted'",
            new { PostId = postId }) == 1;
    }

    public async Task<bool> SetLikeAsync(int postId, int userId, bool liked, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        if (liked)
            await db.ExecuteAsync("""
                IF EXISTS(SELECT 1 FROM public.posts WHERE "postid"=@PostId AND "status"='Visible')
                    IF NOT EXISTS(SELECT 1 FROM public.postlikes WHERE "postid"=@PostId AND "userid"=@UserId)
                        INSERT INTO public.postlikes("postid","userid") VALUES(@PostId,@UserId);
                """, new { PostId = postId, UserId = userId });
        else
            await db.ExecuteAsync("DELETE FROM public.postlikes WHERE \"postid\"=@PostId AND \"userid\"=@UserId AND EXISTS(SELECT 1 FROM public.posts WHERE \"postid\"=@PostId AND \"status\"='Visible')",
                new { PostId = postId, UserId = userId });
        return await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM public.posts WHERE \"postid\"=@PostId AND \"status\"='Visible'", new { PostId = postId }) > 0;
    }

    public async Task<List<CommunityCommentView>> GetCommentsAsync(int postId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return (await db.QueryAsync<CommunityCommentView>("""
            SELECT c."commentid",c."postid",c."userid",u."fullname" AS AuthorName,c."parentcommentid",c."content",c."createdat",c."updatedat"
            FROM public.comments c JOIN public.users u ON u."userid"=c."userid"
            WHERE c."postid"=@PostId AND c."status"='Visible' ORDER BY c."createdat",c."commentid";
            """, new { PostId = postId })).ToList();
    }

    public async Task<int?> CreateCommentAsync(int postId, int userId, int? parentId, string content, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        await db.OpenAsync(ct);
        await using var tx = await db.BeginTransactionAsync(ct);
        if (await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM public.posts WHERE \"postid\"=@PostId AND \"status\"='Visible'", new { PostId = postId }, tx) == 0)
            return null;
        if (parentId is not null && await db.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM public.comments WHERE \"commentid\"=@ParentId AND \"postid\"=@PostId AND \"status\"='Visible'",
            new { ParentId = parentId, PostId = postId }, tx) == 0) return -1;
        var id = await db.ExecuteScalarAsync<int>("INSERT INTO public.comments(\"postid\",\"userid\",\"parentcommentid\",\"content\") VALUES(@PostId,@UserId,@ParentId,@Content) RETURNING \"commentid\";",
            new { PostId = postId, UserId = userId, ParentId = parentId, Content = content }, tx);
        await tx.CommitAsync(ct);
        return id;
    }

    public async Task<(int? UserId, int? PostId, int? CommunityId, string? Status)> GetCommentPermissionAsync(int commentId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return await db.QuerySingleOrDefaultAsync<(int?, int?, int?, string?)>("""
            SELECT c."userid",c."postid",p."communityid",c."status" FROM public.comments c JOIN public.posts p ON p."postid"=c."postid" WHERE c."commentid"=@CommentId
            """, new { CommentId = commentId });
    }

    public async Task<bool> UpdateCommentAsync(int commentId, string content, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return await db.ExecuteAsync("UPDATE public.comments SET \"content\"=@Content,\"updatedat\"=NOW() AT TIME ZONE 'UTC' WHERE \"commentid\"=@CommentId AND \"status\"='Visible'",
            new { CommentId = commentId, Content = content }) == 1;
    }

    public async Task<bool> DeleteCommentAsync(int commentId, CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        return await db.ExecuteAsync("UPDATE public.comments SET \"status\"='Deleted',\"updatedat\"=NOW() AT TIME ZONE 'UTC' WHERE \"commentid\"=@CommentId AND \"status\"<>'Deleted'",
            new { CommentId = commentId }) == 1;
    }

    public async Task<List<object>> GetAdminCommunitiesAsync(CancellationToken ct)
    {
        await using var db = new NpgsqlConnection(connectionString);
        var rows = await db.QueryAsync("""
            SELECT c."communityid" AS Id,c."artistid",c."name",c."description",c."avatarurl" AS Avatar,c."coverurl" AS Cover,
                   a."name" AS ArtistName,a."slug" AS ArtistSlug,
                   (SELECT COUNT(1) FROM public.communitymembers cm WHERE cm."communityid"=c."communityid") AS MemberCount,
                   (SELECT COUNT(1) FROM public.posts p WHERE p."communityid"=c."communityid" AND p."status"='Visible') AS PostCount
            FROM public.communities c JOIN public.artists a ON a."artistid"=c."artistid" ORDER BY c."communityid";
            """);
        return rows.Select(row => (object)row).ToList();
    }

    private static async Task SaveMediaAsync(NpgsqlConnection db, System.Data.Common.DbTransaction tx, int postId,
        IEnumerable<CommunityMediaRequest> media)
    {
        var order = 0;
        foreach (var item in media)
            await db.ExecuteAsync("INSERT INTO public.postmedia(\"postid\",\"mediatype\",\"mediaurl\",\"sortorder\") VALUES(@PostId,@MediaType,@MediaUrl,@SortOrder)",
                new { PostId = postId,
                    MediaType = item.MediaType?.Equals("Video", StringComparison.OrdinalIgnoreCase) == true ? "Video" : "Image",
                    MediaUrl = item.MediaUrl?.Trim(), SortOrder = order++ }, tx);
    }
}
