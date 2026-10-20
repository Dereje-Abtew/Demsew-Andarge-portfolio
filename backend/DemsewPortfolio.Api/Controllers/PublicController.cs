using DemsewPortfolio.Api.Dtos;
using DemsewPortfolio.Api.Data;
using DemsewPortfolio.Api.Entities;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Net.Mail;

namespace DemsewPortfolio.Api.Controllers;

[ApiController]
[Route("api/public")]
public sealed class PublicController(
    ApplicationDbContext db,
    IValidator<ContactInput> contactValidator,
    IConfiguration configuration,
    ILogger<PublicController> logger) : ControllerBase
{
    [HttpGet("categories")]
    [OutputCache]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> Categories(CancellationToken cancellationToken) =>
        Ok(await db.Categories.AsNoTracking().OrderBy(category => category.SortOrder)
            .Select(category => new CategoryDto(category.Id, category.Name, category.Slug, category.SortOrder))
            .ToListAsync(cancellationToken));

    [HttpGet("projects")]
    [OutputCache]
    public async Task<ActionResult<IReadOnlyList<ProjectDto>>> Projects(
        [FromQuery] string? category, [FromQuery] bool? featured, CancellationToken cancellationToken)
    {
        var query = db.Projects.AsNoTracking().Include(project => project.Category)
            .Where(project => project.IsPublished);
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(project => project.Category!.Slug == category);
        if (featured is not null)
            query = query.Where(project => project.IsFeatured == featured);
        var projects = await query.OrderBy(project => project.SortOrder).ThenByDescending(project => project.Year)
            .ToListAsync(cancellationToken);
        return Ok(projects.Select(ToDto).ToList());
    }

    [HttpGet("projects/{slug}")]
    [OutputCache]
    public async Task<ActionResult<ProjectDto>> Project(string slug, CancellationToken cancellationToken)
    {
        var project = await db.Projects.AsNoTracking().Include(item => item.Category)
            .SingleOrDefaultAsync(item => item.Slug == slug && item.IsPublished, cancellationToken);
        return project is null ? NotFound() : Ok(ToDto(project));
    }

    [HttpGet("testimonials")]
    [OutputCache]
    public async Task<ActionResult<IReadOnlyList<TestimonialDto>>> Testimonials(CancellationToken cancellationToken) =>
        Ok(await db.Testimonials.AsNoTracking().Where(item => item.IsPublished).OrderBy(item => item.SortOrder)
            .Select(item => new TestimonialDto(item.Id, item.ClientName, item.ClientTitle,
                item.ClientImageUrl, item.Quote, item.IsPublished, item.SortOrder))
            .ToListAsync(cancellationToken));

    [HttpGet("services")]
    [OutputCache]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> Services(CancellationToken cancellationToken) =>
        Ok(await db.Services.AsNoTracking().Where(item => item.IsPublished).OrderBy(item => item.SortOrder)
            .Select(item => new ServiceDto(item.Id, item.Title, item.Description,
                item.PriceLabel, item.IsPublished, item.SortOrder))
            .ToListAsync(cancellationToken));

    [HttpGet("settings")]
    [OutputCache]
    public async Task<ActionResult<SiteSettingsDto>> Settings(CancellationToken cancellationToken)
    {
        var settings = await db.SiteSettings.AsNoTracking().SingleOrDefaultAsync(item => item.Id == 1, cancellationToken);
        return settings is null ? NotFound() : Ok(ToDto(settings));
    }

    [HttpPost("contact")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Contact(ContactInput input, CancellationToken cancellationToken)
    {
        var validation = await contactValidator.ValidateAsync(input, cancellationToken);
        if (!validation.IsValid) return ValidationProblem(validation.ToDictionary());

        var message = new ContactMessage
        {
            Name = input.Name.Trim(),
            Email = input.Email.Trim(),
            Phone = input.Phone?.Trim(),
            Subject = input.Subject.Trim(),
            Message = input.Message.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };
        db.ContactMessages.Add(message);
        await db.SaveChangesAsync(cancellationToken);

        var smtpHost = configuration["Email:SmtpHost"];
        if (!string.IsNullOrWhiteSpace(smtpHost))
        {
            try
            {
                using var client = new SmtpClient(smtpHost, configuration.GetValue("Email:Port", 587))
                {
                    EnableSsl = configuration.GetValue("Email:EnableSsl", true),
                    Credentials = new NetworkCredential(configuration["Email:Username"], configuration["Email:Password"])
                };
                var destination = configuration["Email:To"] ?? configuration["Admin:Email"];
                if (string.IsNullOrWhiteSpace(destination))
                    throw new InvalidOperationException("Email:To or Admin:Email is required when SMTP is configured.");
                using var mail = new MailMessage(configuration["Email:From"] ?? "portfolio@localhost", destination)
                {
                    Subject = $"Portfolio inquiry: {WebUtility.HtmlEncode(message.Subject)}",
                    Body = $"From: {WebUtility.HtmlEncode(message.Name)} ({WebUtility.HtmlEncode(message.Email)})\n\n{WebUtility.HtmlEncode(message.Message)}"
                };
                await client.SendMailAsync(mail, cancellationToken);
            }
            catch (Exception exception) when (exception is SmtpException or InvalidOperationException or FormatException or ArgumentException)
            {
                logger.LogError(exception, "Message {MessageId} was saved but notification email failed.", message.Id);
            }
        }
        else
        {
            logger.LogInformation("Message {MessageId} saved. Email notification is not configured.", message.Id);
        }

        return Created($"/api/public/contact/{message.Id}", new { message.Id });
    }

    private static ProjectDto ToDto(Project project) => new(
        project.Id, project.Title, project.Slug, project.Description, project.Client, project.Year,
        project.VideoUrl, project.ThumbnailUrl, project.Tools, project.BeforeAfterUrl,
        project.IsFeatured, project.IsPublished, project.SortOrder, project.CategoryId,
        project.Category?.Name ?? "");

    private static SiteSettingsDto ToDto(SiteSettings settings) => new(
        settings.HeroTitle, settings.HeroSubtitle, settings.ShowreelUrl, settings.AboutText,
        settings.ProfilePhotoUrl, settings.CvUrl, settings.ContactEmail, settings.WhatsApp,
        settings.Telegram, settings.InstagramUrl, settings.YouTubeUrl, settings.TikTokUrl,
        settings.LinkedInUrl, settings.BehanceUrl, settings.Location, settings.SeoTitle, settings.SeoDescription);
}
