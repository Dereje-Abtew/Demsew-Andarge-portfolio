using DemsewPortfolio.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace DemsewPortfolio.Api.Data;

public sealed class PortfolioSeeder(
    ApplicationDbContext db,
    UserManager<ApplicationUser> users,
    RoleManager<IdentityRole> roles,
    IConfiguration configuration,
    ILogger<PortfolioSeeder> logger)
{
    public async Task SeedAsync()
    {
        const string adminRole = "Admin";
        if (!await roles.RoleExistsAsync(adminRole))
        {
            var roleResult = await roles.CreateAsync(new IdentityRole(adminRole));
            EnsureSuccess(roleResult, "create admin role");
        }

        var email = configuration["Admin:Email"];
        var password = configuration["Admin:Password"];
        if (!string.IsNullOrWhiteSpace(email) && !string.IsNullOrWhiteSpace(password))
        {
            var user = await users.FindByEmailAsync(email);
            if (user is null)
            {
                user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
                var createResult = await users.CreateAsync(user, password);
                EnsureSuccess(createResult, "create admin user");
            }

            if (!await users.IsInRoleAsync(user, adminRole))
            {
                EnsureSuccess(await users.AddToRoleAsync(user, adminRole), "assign admin role");
            }
        }
        else if (configuration.GetValue<bool>("RequireAdminCredentials"))
        {
            throw new InvalidOperationException("Admin:Email and Admin:Password must be configured.");
        }
        else
        {
            logger.LogWarning("Admin account was not seeded. Configure Admin__Email and Admin__Password.");
        }

        if (!await db.Categories.AnyAsync())
        {
            var categories = new[]
            {
                ("Commercials", "commercials"), ("Music Videos", "music-videos"),
                ("Weddings", "weddings"), ("Social Media / Reels", "social-media"),
                ("Documentaries", "documentaries"), ("Corporate", "corporate"),
                ("Motion Graphics", "motion-graphics")
            };
            for (var index = 0; index < categories.Length; index++)
            {
                db.Categories.Add(new Category
                {
                    Name = categories[index].Item1,
                    Slug = categories[index].Item2,
                    SortOrder = index
                });
            }
            await db.SaveChangesAsync();
        }

        if (!await db.Projects.AnyAsync())
        {
            var commercial = await db.Categories.FirstAsync(category => category.Slug == "commercials");
            var music = await db.Categories.FirstAsync(category => category.Slug == "music-videos");
            db.Projects.AddRange(
                new Project
                {
                    Title = "A Story in Motion", Slug = "a-story-in-motion",
                    Description = "A sample project. Replace this with a real campaign and project details.",
                    Client = "Sample Client", Year = DateTime.UtcNow.Year, VideoUrl = "https://www.youtube.com/watch?v=ScMzIvxBSi4",
                    ThumbnailUrl = "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?auto=format&fit=crop&w=1200&q=80",
                    Tools = "Premiere Pro, After Effects", IsFeatured = true, IsPublished = true, SortOrder = 0,
                    CategoryId = commercial.Id
                },
                new Project
                {
                    Title = "After the Rhythm", Slug = "after-the-rhythm",
                    Description = "A sample music video project. Replace this content with your own work.",
                    Client = "Independent Artist", Year = DateTime.UtcNow.Year, VideoUrl = "https://vimeo.com/76979871",
                    ThumbnailUrl = "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
                    Tools = "DaVinci Resolve, After Effects", IsFeatured = true, IsPublished = true, SortOrder = 1,
                    CategoryId = music.Id
                });
            await db.SaveChangesAsync();
        }

        if (!await db.Services.AnyAsync())
        {
            db.Services.AddRange(
                new Service
                {
                    Title = "Commercial & Brand Films",
                    Description = "Story-led edits for campaigns, products, and brands.",
                    PriceLabel = "Custom quote",
                    IsPublished = true,
                    SortOrder = 0
                },
                new Service
                {
                    Title = "Music Videos",
                    Description = "Rhythm-driven edits, color, and motion design.",
                    PriceLabel = "Custom quote",
                    IsPublished = true,
                    SortOrder = 1
                },
                new Service
                {
                    Title = "Social Content",
                    Description = "Platform-ready short-form edits and reels.",
                    PriceLabel = "Custom quote",
                    IsPublished = true,
                    SortOrder = 2
                });
            await db.SaveChangesAsync();
        }

        if (!await db.Testimonials.AnyAsync())
        {
            db.Testimonials.Add(new Testimonial
            {
                ClientName = "Sample Client",
                ClientTitle = "Replace with a real client",
                Quote = "A sample testimonial. Replace this text with an approved client review.",
                IsPublished = true,
                SortOrder = 0
            });
            await db.SaveChangesAsync();
        }
    }

    private static void EnsureSuccess(IdentityResult result, string operation)
    {
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(
                $"Could not {operation}: {string.Join("; ", result.Errors.Select(error => error.Description))}");
        }
    }
}
