using DemsewPortfolio.Api.Entities;

namespace DemsewPortfolio.Api.Interfaces;

public sealed record TokenPair(string AccessToken, string RefreshToken, DateTime AccessExpiresAtUtc);

public interface ITokenService
{
    Task<TokenPair> CreateAsync(ApplicationUser user, CancellationToken cancellationToken);
    Task<TokenPair?> RefreshAsync(string refreshToken, CancellationToken cancellationToken);
}
