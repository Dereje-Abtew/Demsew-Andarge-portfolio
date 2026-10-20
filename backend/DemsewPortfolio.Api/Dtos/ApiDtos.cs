namespace DemsewPortfolio.Api.Dtos;

public sealed record LoginRequest(string Email, string Password);
public sealed record RefreshRequest(string RefreshToken);
public sealed record TokenResponse(string AccessToken, string RefreshToken, DateTime AccessExpiresAtUtc);
public sealed record CategoryDto(int Id, string Name, string Slug, int SortOrder);
public sealed record ProjectDto(
    int Id, string Title, string Slug, string Description, string? Client, int Year,
    string VideoUrl, string? ThumbnailUrl, string? Tools, string? BeforeAfterUrl,
    bool IsFeatured, bool IsPublished, int SortOrder, int CategoryId, string CategoryName);
public sealed record ProjectInput(
    string Title, string Slug, string Description, string? Client, int Year,
    string VideoUrl, string? ThumbnailUrl, string? Tools, string? BeforeAfterUrl,
    bool IsFeatured, bool IsPublished, int SortOrder, int CategoryId);
public sealed record CategoryInput(string Name, string Slug, int SortOrder);
public sealed record TestimonialDto(
    int Id, string ClientName, string? ClientTitle, string? ClientImageUrl,
    string Quote, bool IsPublished, int SortOrder);
public sealed record TestimonialInput(
    string ClientName, string? ClientTitle, string? ClientImageUrl,
    string Quote, bool IsPublished, int SortOrder);
public sealed record ServiceDto(int Id, string Title, string Description, string? PriceLabel, bool IsPublished, int SortOrder);
public sealed record ServiceInput(string Title, string Description, string? PriceLabel, bool IsPublished, int SortOrder);
public sealed record SiteSettingsDto(
    string HeroTitle, string HeroSubtitle, string? ShowreelUrl, string AboutText,
    string? ProfilePhotoUrl, string? CvUrl, string ContactEmail, string? WhatsApp,
    string? Telegram, string? InstagramUrl, string? YouTubeUrl, string? TikTokUrl,
    string? LinkedInUrl, string? BehanceUrl, string Location, string SeoTitle, string SeoDescription);
public sealed record ContactInput(string Name, string Email, string? Phone, string Subject, string Message);
public sealed record MessageDto(int Id, string Name, string Email, string? Phone, string Subject, string Message, DateTime CreatedAtUtc, bool IsRead);
public sealed record DashboardDto(
    int Projects, int Messages, int UnreadMessages, int Categories, int Testimonials, int Services,
    IReadOnlyList<MessageDto> LatestMessages);
