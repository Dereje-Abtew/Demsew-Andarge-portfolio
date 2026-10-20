using Microsoft.AspNetCore.Identity;

namespace DemsewPortfolio.Api.Entities;

public sealed class ApplicationUser : IdentityUser
{
    public ICollection<RefreshToken> RefreshTokens { get; } = [];
}

public sealed class RefreshToken
{
    public int Id { get; set; }
    public required string UserId { get; set; }
    public required string TokenHash { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    public ApplicationUser? User { get; set; }
}

public sealed class Category
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public int SortOrder { get; set; }
    public ICollection<Project> Projects { get; } = [];
}

public sealed class Project
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Slug { get; set; }
    public required string Description { get; set; }
    public string? Client { get; set; }
    public int Year { get; set; }
    public required string VideoUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? Tools { get; set; }
    public string? BeforeAfterUrl { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
}

public sealed class Testimonial
{
    public int Id { get; set; }
    public required string ClientName { get; set; }
    public string? ClientTitle { get; set; }
    public string? ClientImageUrl { get; set; }
    public required string Quote { get; set; }
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
}

public sealed class Service
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public string? PriceLabel { get; set; }
    public bool IsPublished { get; set; }
    public int SortOrder { get; set; }
}

public sealed class ContactMessage
{
    public int Id { get; set; }
    public required string Name { get; set; }
    public required string Email { get; set; }
    public string? Phone { get; set; }
    public required string Subject { get; set; }
    public required string Message { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public bool IsRead { get; set; }
}

public sealed class SiteSettings
{
    public int Id { get; set; }
    public required string HeroTitle { get; set; }
    public required string HeroSubtitle { get; set; }
    public string? ShowreelUrl { get; set; }
    public required string AboutText { get; set; }
    public string? ProfilePhotoUrl { get; set; }
    public string? CvUrl { get; set; }
    public required string ContactEmail { get; set; }
    public string? WhatsApp { get; set; }
    public string? Telegram { get; set; }
    public string? InstagramUrl { get; set; }
    public string? YouTubeUrl { get; set; }
    public string? TikTokUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public string? BehanceUrl { get; set; }
    public required string Location { get; set; }
    public required string SeoTitle { get; set; }
    public required string SeoDescription { get; set; }
}
