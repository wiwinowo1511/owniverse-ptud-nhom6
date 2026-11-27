using System.Collections.Concurrent;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace OwniverseApi;

public sealed record SessionEntry(int UserId, DateTime LastActivityUtc);

public sealed class AuthContext
{
    private readonly ConcurrentDictionary<string, SessionEntry> _sessions = new();
    private readonly TimeSpan _sessionIdleTimeout = TimeSpan.FromMinutes(30);
    private readonly List<PasswordResetToken> _passwordResetTokens = new();
    private readonly object _dataLock = new();
    private readonly ILogger _logger;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthContext(
        List<User> users,
        List<Artist> artists,
        List<Category> categories,
        List<Product> products,
        List<Community> communities,
        List<CommunityMember> communityMembers,
        Dictionary<int, List<CartItem>> carts,
        List<Order> orders,
        ILogger logger,
        IPasswordHasher<User> passwordHasher)
    {
        Users = users;
        Artists = artists;
        Categories = categories;
        Products = products;
        Communities = communities;
        CommunityMembers = communityMembers;
        Carts = carts;
        Orders = orders;
        _logger = logger;
        _passwordHasher = passwordHasher;

        NextUserId = users.Select(u => u.Id).DefaultIfEmpty(0).Max() + 1;
        NextArtistId = artists.Select(a => a.Id).DefaultIfEmpty(0).Max() + 1;
        NextCategoryId = categories.Select(c => c.Id).DefaultIfEmpty(0).Max() + 1;
        NextProductId = products.Select(p => p.Id).DefaultIfEmpty(0).Max() + 1;
        NextVariantId = products.SelectMany(p => p.Variants).Select(v => v.Id).DefaultIfEmpty(0).Max() + 1;
        NextCommunityId = communities.Select(c => c.Id).DefaultIfEmpty(0).Max() + 1;
        NextOrderId = orders.Select(o => o.Id).DefaultIfEmpty(0).Max() + 1;
    }

    public List<User> Users { get; }
    public List<Artist> Artists { get; }
    public List<Category> Categories { get; }
    public List<Product> Products { get; }
    public List<Community> Communities { get; }
    public List<CommunityMember> CommunityMembers { get; }
    public Dictionary<int, List<CartItem>> Carts { get; }
    public List<Order> Orders { get; }

    public int NextUserId { get; set; }
    public int NextArtistId { get; set; }
    public int NextCategoryId { get; set; }
    public int NextProductId { get; set; }
    public int NextVariantId { get; set; }
    public int NextCommunityId { get; set; }
    public int NextOrderId { get; set; }

    public List<PasswordResetToken> PasswordResetTokens => _passwordResetTokens;

    public object DataLock => _dataLock;
    public ILogger Logger => _logger;
    public IPasswordHasher<User> PasswordHasher => _passwordHasher;

    public User? GetCurrentUser(HttpContext ctx)
    {
        var token = EndpointHelpers.GetToken(ctx);
        if (!TryGetActiveSession(token, out var userId)) return null;

        var user = Users.FirstOrDefault(u => u.Id == userId);
        if (user is null || !string.Equals(user.Status, UserStatus.Active, StringComparison.OrdinalIgnoreCase))
        {
            _sessions.TryRemove(token, out _);
            return null;
        }
        return user;
    }

    public async Task<User?> GetCurrentUserFromDatabaseAsync(HttpContext ctx, UserRepository userRepository)
    {
        var token = EndpointHelpers.GetToken(ctx);
        if (!TryGetActiveSession(token, out var userId)) return null;

        var user = await userRepository.FindByIdAsync(userId, ctx.RequestAborted);
        if (user is null || !string.Equals(user.Status, UserStatus.Active, StringComparison.OrdinalIgnoreCase))
        {
            _sessions.TryRemove(token, out _);
            return null;
        }

        CacheUser(user);
        return user;
    }

    public bool TryGetActiveSession(string token, out int userId)
    {
        userId = 0;
        while (_sessions.TryGetValue(token, out var session))
        {
            var now = DateTime.UtcNow;
            if (now - session.LastActivityUtc >= _sessionIdleTimeout)
            {
                _sessions.TryRemove(token, out _);
                return false;
            }

            var touched = session with { LastActivityUtc = now };
            if (_sessions.TryUpdate(token, touched, session))
            {
                userId = session.UserId;
                return true;
            }
        }
        return false;
    }

    public IResult? CheckRole(HttpContext ctx, params string[] allowedRoles)
    {
        var user = GetCurrentUser(ctx);
        if (user is null) return EndpointHelpers.Msg(401, "Bạn chưa đăng nhập");
        if (!allowedRoles.Any(r => r == user.Role)) return EndpointHelpers.Msg(403, "Bạn không có quyền thực hiện thao tác này");
        return null;
    }

    public void RemoveSessionsOf(int userId)
    {
        foreach (var item in _sessions.Where(s => s.Value.UserId == userId).ToList())
            _sessions.TryRemove(item.Key, out _);
    }

    public Artist? GetMyArtist(HttpContext ctx)
    {
        var user = GetCurrentUser(ctx);
        return user is null ? null : Artists.FirstOrDefault(a => a.UserId == user.Id);
    }

    public Community? CommunityForArtist(int artistId) =>
        Communities.FirstOrDefault(c => c.ArtistId == artistId);

    public UserDto PublicUser(User u)
    {
        var linked = Artists.FirstOrDefault(a => a.UserId == u.Id);
        return new UserDto(
            u.Id, u.FullName, u.Email, u.Phone, u.Address, u.Role, u.Status, u.CreatedAt,
            linked?.Id, linked?.Slug);
    }

    public void CacheUser(User user)
    {
        lock (_dataLock)
        {
            var index = Users.FindIndex(existing => existing.Id == user.Id);
            if (index < 0) Users.Add(user);
            else Users[index] = user;
        }
    }

    public void InvalidateResetTokens(int userId)
    {
        foreach (var t in _passwordResetTokens.Where(t => t.UserId == userId && t.UsedAt is null))
            t.UsedAt = DateTime.UtcNow;
    }

    public void AddResetToken(PasswordResetToken token) => _passwordResetTokens.Add(token);

    public PasswordResetToken? FindValidResetToken(string tokenHash) =>
        _passwordResetTokens.FirstOrDefault(x => x.TokenHash == tokenHash && x.UsedAt is null && x.ExpiresAt > DateTime.UtcNow);

    public string CreateSession(int userId)
    {
        var token = Guid.NewGuid().ToString();
        _sessions[token] = new SessionEntry(userId, DateTime.UtcNow);
        return token;
    }

    public void RemoveSession(string token) => _sessions.TryRemove(token, out _);

    public string HashResetToken(string token) => EndpointHelpers.HashResetToken(token);
}