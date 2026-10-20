using System.Text;
using DemsewPortfolio.Api.Dtos;
using DemsewPortfolio.Api.Data;
using DemsewPortfolio.Api.Entities;
using DemsewPortfolio.Api.Interfaces;
using DemsewPortfolio.Api.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DemsewPortfolio.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin")]
public sealed class AdminController(
    ApplicationDbContext db,
    IFileStorage storage,
    IValidator<CategoryInput> categoryValidator,
    IValidator<ProjectInput> projectValidator,
    IValidator<TestimonialInput> testimonialValidator,
    IValidator<ServiceInput> serviceValidator) : ControllerBase
{
    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDto>> Dashboard(CancellationToken cancellationToken)
    {
        var latestMessages = await db.ContactMessages.AsNoTracking()
            .OrderByDescending(item => item.CreatedAtUtc).Take(5)
            .Select(item => new MessageDto(item.Id, item.Name, item.Email, item.Phone,
                item.Subject, item.Message, item.CreatedAtUtc, item.IsRead))
            .ToListAsync(cancellationToken);
        return Ok(new DashboardDto(
            await db.Projects.CountAsync(cancellationToken),
            await db.ContactMessages.CountAsync(cancellationToken),
            await db.ContactMessages.CountAsync(item => !item.IsRead, cancellationToken),
            await db.Categories.CountAsync(cancellationToken),
            await db.Testimonials.CountAsync(cancellationToken),
            await db.Services.CountAsync(cancellationToken),
            latestMessages));
    }

    [HttpGet("categories")]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>> Categories(CancellationToken cancellationToken) =>
        Ok(await db.Categories.AsNoTracking().OrderBy(item => item.SortOrder)
            .Select(item => new CategoryDto(item.Id, item.Name, item.Slug, item.SortOrder))
            .ToListAsync(cancellationToken));

    [HttpPost("categories")]
    public async Task<ActionResult<CategoryDto>> CreateCategory(CategoryInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, categoryValidator, cancellationToken);
        if (invalid is not null) return invalid;
        if (await db.Categories.AnyAsync(item => item.Slug == input.Slug, cancellationToken))
            return Conflict(new ProblemDetails { Title = "Category slug is already in use.", Status = 409 });
        var category = new Category { Name = input.Name.Trim(), Slug = input.Slug, SortOrder = input.SortOrder };
        db.Categories.Add(category);
        await db.SaveChangesAsync(cancellationToken);
        return CreatedAtAction(nameof(Categories), new CategoryDto(category.Id, category.Name, category.Slug, category.SortOrder));
    }

    [HttpPut("categories/{id:int}")]
    public async Task<IActionResult> UpdateCategory(int id, CategoryInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, categoryValidator, cancellationToken);
        if (invalid is not null) return invalid;
        var item = await db.Categories.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        if (await db.Categories.AnyAsync(other => other.Id != id && other.Slug == input.Slug, cancellationToken))
            return Conflict(new ProblemDetails { Title = "Category slug is already in use.", Status = 409 });
        item.Name = input.Name.Trim();
        item.Slug = input.Slug;
        item.SortOrder = input.SortOrder;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("categories/{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id, CancellationToken cancellationToken)
    {
        var item = await db.Categories.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        if (await db.Projects.AnyAsync(project => project.CategoryId == id, cancellationToken))
            return Conflict(new ProblemDetails { Title = "Move or delete this category's projects first.", Status = 409 });
        db.Categories.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("projects")]
    public async Task<ActionResult<IReadOnlyList<ProjectDto>>> Projects(CancellationToken cancellationToken)
    {
        var items = await db.Projects.AsNoTracking().Include(item => item.Category)
            .OrderBy(item => item.SortOrder).ToListAsync(cancellationToken);
        return Ok(items.Select(ProjectDtoFrom).ToList());
    }

    [HttpPost("projects")]
    public async Task<ActionResult<ProjectDto>> CreateProject(ProjectInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, projectValidator, cancellationToken);
        if (invalid is not null) return invalid;
        if (await db.Projects.AnyAsync(item => item.Slug == input.Slug, cancellationToken))
            return Conflict(new ProblemDetails { Title = "Project slug is already in use.", Status = 409 });
        if (!await db.Categories.AnyAsync(item => item.Id == input.CategoryId, cancellationToken))
            return BadRequest(new ProblemDetails { Title = "Category does not exist.", Status = 400 });
        var project = new Project { Title = input.Title.Trim(), Slug = input.Slug, Description = input.Description.Trim() };
        Apply(project, input);
        db.Projects.Add(project);
        await db.SaveChangesAsync(cancellationToken);
        await db.Entry(project).Reference(item => item.Category).LoadAsync(cancellationToken);
        return Created($"/api/admin/projects/{project.Id}", ProjectDtoFrom(project));
    }

    [HttpPut("projects/{id:int}")]
    public async Task<IActionResult> UpdateProject(int id, ProjectInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, projectValidator, cancellationToken);
        if (invalid is not null) return invalid;
        var project = await db.Projects.FindAsync([id], cancellationToken);
        if (project is null) return NotFound();
        if (await db.Projects.AnyAsync(item => item.Id != id && item.Slug == input.Slug, cancellationToken))
            return Conflict(new ProblemDetails { Title = "Project slug is already in use.", Status = 409 });
        if (!await db.Categories.AnyAsync(item => item.Id == input.CategoryId, cancellationToken))
            return BadRequest(new ProblemDetails { Title = "Category does not exist.", Status = 400 });
        Apply(project, input);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("projects/{id:int}")]
    public async Task<IActionResult> DeleteProject(int id, CancellationToken cancellationToken)
    {
        var project = await db.Projects.FindAsync([id], cancellationToken);
        if (project is null) return NotFound();
        db.Projects.Remove(project);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPut("projects/order")]
    public async Task<IActionResult> OrderProjects([FromBody] IReadOnlyList<int> orderedIds, CancellationToken cancellationToken)
    {
        if (orderedIds.Count > 500 || orderedIds.Distinct().Count() != orderedIds.Count)
            return BadRequest(new ProblemDetails { Title = "Order must contain up to 500 unique project IDs.", Status = 400 });
        var projects = await db.Projects.Where(item => orderedIds.Contains(item.Id)).ToListAsync(cancellationToken);
        if (projects.Count != orderedIds.Count) return BadRequest(new ProblemDetails { Title = "One or more project IDs were not found.", Status = 400 });
        for (var index = 0; index < orderedIds.Count; index++)
            projects.Single(item => item.Id == orderedIds[index]).SortOrder = index;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("testimonials")]
    public async Task<ActionResult<IReadOnlyList<TestimonialDto>>> Testimonials(CancellationToken cancellationToken) =>
        Ok(await db.Testimonials.AsNoTracking().OrderBy(item => item.SortOrder)
            .Select(item => new TestimonialDto(item.Id, item.ClientName, item.ClientTitle,
                item.ClientImageUrl, item.Quote, item.IsPublished, item.SortOrder))
            .ToListAsync(cancellationToken));

    [HttpPost("testimonials")]
    public async Task<ActionResult<TestimonialDto>> CreateTestimonial(TestimonialInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, testimonialValidator, cancellationToken);
        if (invalid is not null) return invalid;
        var item = new Testimonial();
        Apply(item, input);
        db.Testimonials.Add(item);
        await db.SaveChangesAsync(cancellationToken);
        return Created($"/api/admin/testimonials/{item.Id}", TestimonialDtoFrom(item));
    }

    [HttpPut("testimonials/{id:int}")]
    public async Task<IActionResult> UpdateTestimonial(int id, TestimonialInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, testimonialValidator, cancellationToken);
        if (invalid is not null) return invalid;
        var item = await db.Testimonials.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        Apply(item, input);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("testimonials/{id:int}")]
    public async Task<IActionResult> DeleteTestimonial(int id, CancellationToken cancellationToken)
    {
        var item = await db.Testimonials.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        db.Testimonials.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("services")]
    public async Task<ActionResult<IReadOnlyList<ServiceDto>>> Services(CancellationToken cancellationToken) =>
        Ok(await db.Services.AsNoTracking().OrderBy(item => item.SortOrder)
            .Select(item => new ServiceDto(item.Id, item.Title, item.Description,
                item.PriceLabel, item.IsPublished, item.SortOrder))
            .ToListAsync(cancellationToken));

    [HttpPost("services")]
    public async Task<ActionResult<ServiceDto>> CreateService(ServiceInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, serviceValidator, cancellationToken);
        if (invalid is not null) return invalid;
        var item = new Entities.Service();
        Apply(item, input);
        db.Services.Add(item);
        await db.SaveChangesAsync(cancellationToken);
        return Created($"/api/admin/services/{item.Id}", ServiceDtoFrom(item));
    }

    [HttpPut("services/{id:int}")]
    public async Task<IActionResult> UpdateService(int id, ServiceInput input, CancellationToken cancellationToken)
    {
        var invalid = await Validate(input, serviceValidator, cancellationToken);
        if (invalid is not null) return invalid;
        var item = await db.Services.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        Apply(item, input);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("services/{id:int}")]
    public async Task<IActionResult> DeleteService(int id, CancellationToken cancellationToken)
    {
        var item = await db.Services.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        db.Services.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("settings")]
    public async Task<ActionResult<SiteSettingsDto>> GetSettings(CancellationToken cancellationToken)
    {
        var settings = await db.SiteSettings.SingleOrDefaultAsync(item => item.Id == 1, cancellationToken);
        return settings is null ? NotFound() : Ok(SettingsDtoFrom(settings));
    }

    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings(SiteSettingsDto input, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(input.HeroTitle) || input.HeroTitle.Length > 160 ||
            string.IsNullOrWhiteSpace(input.HeroSubtitle) || input.HeroSubtitle.Length > 200 ||
            string.IsNullOrWhiteSpace(input.AboutText) || input.AboutText.Length > 10000 ||
            !System.Net.Mail.MailAddress.TryCreate(input.ContactEmail, out _) ||
            !ValidSettingsUrl(input.ShowreelUrl) || !ValidSettingsUrl(input.ProfilePhotoUrl) || !ValidSettingsUrl(input.CvUrl) ||
            !ValidSettingsUrl(input.InstagramUrl) || !ValidSettingsUrl(input.YouTubeUrl) ||
            !ValidSettingsUrl(input.TikTokUrl) || !ValidSettingsUrl(input.LinkedInUrl) || !ValidSettingsUrl(input.BehanceUrl) ||
            string.IsNullOrWhiteSpace(input.Location) || input.Location.Length > 120 ||
            string.IsNullOrWhiteSpace(input.SeoTitle) || input.SeoTitle.Length > 200 ||
            string.IsNullOrWhiteSpace(input.SeoDescription) || input.SeoDescription.Length > 500)
            return BadRequest(new ProblemDetails { Title = "One or more settings fields are invalid.", Status = 400 });
        var settings = await db.SiteSettings.SingleOrDefaultAsync(item => item.Id == 1, cancellationToken);
        if (settings is null) return NotFound();
        settings.HeroTitle = input.HeroTitle.Trim();
        settings.HeroSubtitle = input.HeroSubtitle.Trim();
        settings.ShowreelUrl = input.ShowreelUrl;
        settings.AboutText = input.AboutText.Trim();
        settings.ProfilePhotoUrl = input.ProfilePhotoUrl;
        settings.CvUrl = input.CvUrl;
        settings.ContactEmail = input.ContactEmail.Trim();
        settings.WhatsApp = input.WhatsApp;
        settings.Telegram = input.Telegram;
        settings.InstagramUrl = input.InstagramUrl;
        settings.YouTubeUrl = input.YouTubeUrl;
        settings.TikTokUrl = input.TikTokUrl;
        settings.LinkedInUrl = input.LinkedInUrl;
        settings.BehanceUrl = input.BehanceUrl;
        settings.Location = input.Location.Trim();
        settings.SeoTitle = input.SeoTitle.Trim();
        settings.SeoDescription = input.SeoDescription.Trim();
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("messages")]
    public async Task<ActionResult<IReadOnlyList<MessageDto>>> Messages(
        [FromQuery] string? search, [FromQuery] bool? unread, [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        if (page < 1 || pageSize is < 1 or > 100)
            return BadRequest(new ProblemDetails { Title = "Page must be positive and pageSize must be between 1 and 100.", Status = 400 });
        var query = db.ContactMessages.AsQueryable();
        if (unread == true) query = query.Where(item => !item.IsRead);
        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(item => item.Name.Contains(term) || item.Email.Contains(term) || item.Subject.Contains(term));
        }
        var messages = await query.AsNoTracking().OrderByDescending(item => item.CreatedAtUtc)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(item => new MessageDto(item.Id, item.Name, item.Email, item.Phone,
                item.Subject, item.Message, item.CreatedAtUtc, item.IsRead))
            .ToListAsync(cancellationToken);
        return Ok(messages);
    }

    [HttpPut("messages/{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id, [FromQuery] bool read = true, CancellationToken cancellationToken = default)
    {
        var item = await db.ContactMessages.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        item.IsRead = read;
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpDelete("messages/{id:int}")]
    public async Task<IActionResult> DeleteMessage(int id, CancellationToken cancellationToken)
    {
        var item = await db.ContactMessages.FindAsync([id], cancellationToken);
        if (item is null) return NotFound();
        db.ContactMessages.Remove(item);
        await db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpGet("messages/export")]
    public async Task<IActionResult> ExportMessages(CancellationToken cancellationToken)
    {
        var messages = await db.ContactMessages.AsNoTracking().OrderByDescending(item => item.CreatedAtUtc).ToListAsync(cancellationToken);
        var csv = new StringBuilder("Name,Email,Phone,Subject,Message,CreatedAtUtc,IsRead\r\n");
        foreach (var item in messages)
        {
            csv.AppendJoin(',', Csv(item.Name), Csv(item.Email), Csv(item.Phone ?? ""), Csv(item.Subject),
                Csv(item.Message), Csv(item.CreatedAtUtc.ToString("O")), Csv(item.IsRead.ToString())).Append("\r\n");
        }
        return File(Encoding.UTF8.GetBytes(csv.ToString()), "text/csv; charset=utf-8", "portfolio-messages.csv");
    }

    [HttpPost("uploads")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    public async Task<IActionResult> Upload(IFormFile file, [FromQuery] string folder = "images",
        CancellationToken cancellationToken = default)
    {
        try
        {
            var url = await storage.SaveAsync(file, folder, cancellationToken);
            return Ok(new { url });
        }
        catch (ArgumentException exception)
        {
            return BadRequest(new ProblemDetails { Title = exception.Message, Status = 400 });
        }
    }

    private async Task<BadRequestObjectResult?> Validate<T>(T input, IValidator<T> validator, CancellationToken cancellationToken)
    {
        var result = await validator.ValidateAsync(input, cancellationToken);
        return result.IsValid ? null : BadRequest(new ValidationProblemDetails(result.ToDictionary()));
    }

    private static void Apply(Project item, ProjectInput input)
    {
        item.Title = input.Title.Trim();
        item.Slug = input.Slug;
        item.Description = input.Description.Trim();
        item.Client = input.Client?.Trim();
        item.Year = input.Year;
        item.VideoUrl = input.VideoUrl;
        item.ThumbnailUrl = input.ThumbnailUrl;
        item.Tools = input.Tools;
        item.BeforeAfterUrl = input.BeforeAfterUrl;
        item.IsFeatured = input.IsFeatured;
        item.IsPublished = input.IsPublished;
        item.SortOrder = input.SortOrder;
        item.CategoryId = input.CategoryId;
    }

    private static void Apply(Testimonial item, TestimonialInput input)
    {
        item.ClientName = input.ClientName.Trim();
        item.ClientTitle = input.ClientTitle?.Trim();
        item.ClientImageUrl = input.ClientImageUrl;
        item.Quote = input.Quote.Trim();
        item.IsPublished = input.IsPublished;
        item.SortOrder = input.SortOrder;
    }

    private static void Apply(Entities.Service item, ServiceInput input)
    {
        item.Title = input.Title.Trim();
        item.Description = input.Description.Trim();
        item.PriceLabel = input.PriceLabel?.Trim();
        item.IsPublished = input.IsPublished;
        item.SortOrder = input.SortOrder;
    }

    private static ProjectDto ProjectDtoFrom(Project item) => new(item.Id, item.Title, item.Slug, item.Description,
        item.Client, item.Year, item.VideoUrl, item.ThumbnailUrl, item.Tools, item.BeforeAfterUrl,
        item.IsFeatured, item.IsPublished, item.SortOrder, item.CategoryId, item.Category!.Name);

    private static TestimonialDto TestimonialDtoFrom(Testimonial item) => new(item.Id, item.ClientName,
        item.ClientTitle, item.ClientImageUrl, item.Quote, item.IsPublished, item.SortOrder);

    private static ServiceDto ServiceDtoFrom(Entities.Service item) =>
        new(item.Id, item.Title, item.Description, item.PriceLabel, item.IsPublished, item.SortOrder);

    private static MessageDto MessageDtoFrom(ContactMessage item) =>
        new(item.Id, item.Name, item.Email, item.Phone, item.Subject, item.Message, item.CreatedAtUtc, item.IsRead);

    private static SiteSettingsDto SettingsDtoFrom(SiteSettings item) => new(item.HeroTitle, item.HeroSubtitle,
        item.ShowreelUrl, item.AboutText, item.ProfilePhotoUrl, item.CvUrl, item.ContactEmail, item.WhatsApp,
        item.Telegram, item.InstagramUrl, item.YouTubeUrl, item.TikTokUrl, item.LinkedInUrl, item.BehanceUrl,
        item.Location, item.SeoTitle, item.SeoDescription);

    private static string Csv(string value)
    {
        var trimmed = value.TrimStart();
        var safe = trimmed.StartsWith('=') || trimmed.StartsWith('+') ||
            trimmed.StartsWith('-') || trimmed.StartsWith('@') ? $"'{value}" : value;
        return $"\"{safe.Replace("\"", "\"\"")}\"";
    }

    private static bool ValidSettingsUrl(string? value) =>
        string.IsNullOrWhiteSpace(value) ||
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps ||
        value.StartsWith("/uploads/", StringComparison.Ordinal);
}
