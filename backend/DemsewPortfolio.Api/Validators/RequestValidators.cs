using DemsewPortfolio.Api.Dtos;
using FluentValidation;

namespace DemsewPortfolio.Api.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(request => request.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(request => request.Password).NotEmpty().MaximumLength(128);
    }
}

public sealed class ContactInputValidator : AbstractValidator<ContactInput>
{
    public ContactInputValidator()
    {
        RuleFor(input => input.Name).NotEmpty().MaximumLength(120);
        RuleFor(input => input.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(input => input.Phone).MaximumLength(40);
        RuleFor(input => input.Subject).NotEmpty().MaximumLength(180);
        RuleFor(input => input.Message).NotEmpty().MaximumLength(5000);
    }
}

public sealed class CategoryInputValidator : AbstractValidator<CategoryInput>
{
    public CategoryInputValidator()
    {
        RuleFor(input => input.Name).NotEmpty().MaximumLength(80);
        RuleFor(input => input.Slug).NotEmpty().Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").MaximumLength(100);
        RuleFor(input => input.SortOrder).GreaterThanOrEqualTo(0);
    }
}

public sealed class ProjectInputValidator : AbstractValidator<ProjectInput>
{
    public ProjectInputValidator()
    {
        RuleFor(input => input.Title).NotEmpty().MaximumLength(160);
        RuleFor(input => input.Slug).NotEmpty().Matches("^[a-z0-9]+(?:-[a-z0-9]+)*$").MaximumLength(180);
        RuleFor(input => input.Description).NotEmpty().MaximumLength(5000);
        RuleFor(input => input.Client).MaximumLength(160);
        RuleFor(input => input.Year).InclusiveBetween(1900, 2200);
        RuleFor(input => input.VideoUrl).NotEmpty().Must(ValidVideoUrl)
            .WithMessage("Use a valid HTTPS YouTube, Vimeo, or MP4 URL.");
        RuleFor(input => input.ThumbnailUrl).Must(ValidOptionalUrl);
        RuleFor(input => input.BeforeAfterUrl).Must(ValidOptionalUrl);
        RuleFor(input => input.Tools).MaximumLength(500);
        RuleFor(input => input.CategoryId).GreaterThan(0);
        RuleFor(input => input.SortOrder).GreaterThanOrEqualTo(0);
    }

    internal static bool ValidOptionalUrl(string? value) =>
        string.IsNullOrWhiteSpace(value) ||
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps ||
        value.StartsWith("/uploads/", StringComparison.Ordinal);

    private static bool ValidVideoUrl(string value)
    {
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps) return false;
        return uri.Host is "youtube.com" or "www.youtube.com" or "youtu.be" or "vimeo.com" or "www.vimeo.com"
            || uri.AbsolutePath.EndsWith(".mp4", StringComparison.OrdinalIgnoreCase);
    }
}

public sealed class TestimonialInputValidator : AbstractValidator<TestimonialInput>
{
    public TestimonialInputValidator()
    {
        RuleFor(input => input.ClientName).NotEmpty().MaximumLength(160);
        RuleFor(input => input.ClientTitle).MaximumLength(160);
        RuleFor(input => input.Quote).NotEmpty().MaximumLength(2000);
        RuleFor(input => input.ClientImageUrl).Must(ProjectInputValidator.ValidOptionalUrl);
        RuleFor(input => input.SortOrder).GreaterThanOrEqualTo(0);
    }
}

public sealed class ServiceInputValidator : AbstractValidator<ServiceInput>
{
    public ServiceInputValidator()
    {
        RuleFor(input => input.Title).NotEmpty().MaximumLength(160);
        RuleFor(input => input.Description).NotEmpty().MaximumLength(2000);
        RuleFor(input => input.PriceLabel).MaximumLength(100);
        RuleFor(input => input.SortOrder).GreaterThanOrEqualTo(0);
    }
}
