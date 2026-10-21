using DemsewPortfolio.Api.Dtos;
using DemsewPortfolio.Api.Entities;
using DemsewPortfolio.Api.Interfaces;
using DemsewPortfolio.Api.Services;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace DemsewPortfolio.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    UserManager<ApplicationUser> users,
    SignInManager<ApplicationUser> signIn,
    ITokenService tokens,
    DemsewPortfolio.Api.Data.ApplicationDbContext db,
    IValidator<LoginRequest> validator) : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<ActionResult<TokenResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var validation = await validator.ValidateAsync(request, cancellationToken);
        if (!validation.IsValid) return BadRequest(new ValidationProblemDetails(validation.ToDictionary()));

        var user = await users.FindByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized(new ProblemDetails { Title = "Invalid email or password.", Status = StatusCodes.Status401Unauthorized });
        var signInResult = await signIn.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
        if (!signInResult.Succeeded)
            return Unauthorized(new ProblemDetails { Title = "Invalid email or password.", Status = StatusCodes.Status401Unauthorized });
        if (!await users.IsInRoleAsync(user, "Admin"))
            return Forbid();

        var pair = await tokens.CreateAsync(user, cancellationToken);
        return Ok(new TokenResponse(pair.AccessToken, pair.RefreshToken, pair.AccessExpiresAtUtc));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> Refresh(RefreshRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new ProblemDetails { Title = "Refresh token is required.", Status = StatusCodes.Status400BadRequest });

        var pair = await tokens.RefreshAsync(request.RefreshToken, cancellationToken);
        return pair is null
            ? Unauthorized(new ProblemDetails { Title = "Refresh token is invalid or expired.", Status = StatusCodes.Status401Unauthorized })
            : Ok(new TokenResponse(pair.AccessToken, pair.RefreshToken, pair.AccessExpiresAtUtc));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request, CancellationToken cancellationToken)
    {
        var tokenHash = Convert.ToHexString(System.Security.Cryptography.SHA256.HashData(
            System.Text.Encoding.UTF8.GetBytes(request.RefreshToken)));
        var stored = await db.RefreshTokens.SingleOrDefaultAsync(token => token.TokenHash == tokenHash, cancellationToken);
        if (stored is not null && stored.RevokedAtUtc is null)
        {
            stored.RevokedAtUtc = DateTime.UtcNow;
            await db.SaveChangesAsync(cancellationToken);
        }
        return NoContent();
    }
}
