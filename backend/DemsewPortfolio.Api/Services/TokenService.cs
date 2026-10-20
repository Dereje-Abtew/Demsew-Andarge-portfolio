using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using DemsewPortfolio.Api.Data;
using DemsewPortfolio.Api.Entities;
using DemsewPortfolio.Api.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace DemsewPortfolio.Api.Services;

public sealed class TokenService(
    ApplicationDbContext db,
    UserManager<ApplicationUser> users,
    IConfiguration configuration) : ITokenService
{
    public async Task<TokenPair> CreateAsync(ApplicationUser user, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var accessExpiry = now.AddMinutes(configuration.GetValue("Jwt:AccessTokenMinutes", 15));
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var roles = await users.GetRolesAsync(user);
        claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Secret"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var jwt = new JwtSecurityToken(
            configuration["Jwt:Issuer"], configuration["Jwt:Audience"], claims,
            now, accessExpiry, credentials);
        var rawRefreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = Hash(rawRefreshToken),
            ExpiresAtUtc = now.AddDays(configuration.GetValue("Jwt:RefreshTokenDays", 14))
        });
        await db.SaveChangesAsync(cancellationToken);
        return new TokenPair(new JwtSecurityTokenHandler().WriteToken(jwt), rawRefreshToken, accessExpiry);
    }

    public async Task<TokenPair?> RefreshAsync(string refreshToken, CancellationToken cancellationToken)
    {
        var hash = Hash(refreshToken);
        var stored = await db.RefreshTokens.Include(token => token.User)
            .SingleOrDefaultAsync(token => token.TokenHash == hash, cancellationToken);
        if (stored?.User is null)
        {
            return null;
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var now = DateTime.UtcNow;
        var claimed = await db.RefreshTokens
            .Where(token => token.Id == stored.Id && token.RevokedAtUtc == null && token.ExpiresAtUtc > now)
            .ExecuteUpdateAsync(updates => updates.SetProperty(token => token.RevokedAtUtc, now), cancellationToken);
        if (claimed == 0)
        {
            await transaction.RollbackAsync(cancellationToken);
            return null;
        }

        var next = await CreateAsync(stored.User, cancellationToken);
        await db.RefreshTokens.Where(token => token.Id == stored.Id)
            .ExecuteUpdateAsync(updates => updates.SetProperty(token => token.ReplacedByTokenHash, Hash(next.RefreshToken)), cancellationToken);
        await transaction.CommitAsync(cancellationToken);
        return next;
    }

    private static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}
