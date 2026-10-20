using DemsewPortfolio.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DemsewPortfolio.Api.Data;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : IdentityDbContext<ApplicationUser, IdentityRole, string>(options)
{
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Testimonial> Testimonials => Set<Testimonial>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();
    public DbSet<SiteSettings> SiteSettings => Set<SiteSettings>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.Entity<RefreshToken>().HasIndex(token => token.TokenHash).IsUnique();
        builder.Entity<RefreshToken>().Property(token => token.TokenHash).HasMaxLength(64);
        builder.Entity<RefreshToken>().Property(token => token.ReplacedByTokenHash).HasMaxLength(64);
        builder.Entity<RefreshToken>().HasOne(token => token.User).WithMany(user => user.RefreshTokens)
            .HasForeignKey(token => token.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.Entity<Category>().HasIndex(category => category.Slug).IsUnique();
        builder.Entity<Category>().Property(category => category.Slug).HasMaxLength(100);
        builder.Entity<Project>().HasIndex(project => project.Slug).IsUnique();
        builder.Entity<Project>().Property(project => project.Slug).HasMaxLength(180);
        builder.Entity<Project>().HasOne(project => project.Category).WithMany(category => category.Projects)
            .HasForeignKey(project => project.CategoryId).OnDelete(DeleteBehavior.Restrict);
        builder.Entity<ContactMessage>().HasIndex(message => message.CreatedAtUtc);
        builder.Entity<SiteSettings>().HasData(new SiteSettings
        {
            Id = 1,
            HeroTitle = "Demsew Andarge",
            HeroSubtitle = "Video Editor & Motion Storyteller",
            AboutText = "I shape raw footage into stories that move people.",
            ContactEmail = "hello@example.com",
            Location = "Ethiopia",
            SeoTitle = "Demsew Andarge — Video Editor",
            SeoDescription = "Cinematic video editing and motion storytelling."
        });
    }
}
