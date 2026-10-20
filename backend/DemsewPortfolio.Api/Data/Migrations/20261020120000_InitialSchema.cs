using DemsewPortfolio.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace DemsewPortfolio.Api.Data.Migrations;

[DbContext(typeof(ApplicationDbContext))]
[Migration("20261020120000_InitialSchema")]
public sealed class InitialSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        var sqlite = ActiveProvider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase);
        var postgres = ActiveProvider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase);
        if (sqlite)
        {
            migrationBuilder.Sql("""
                CREATE TABLE "AspNetRoles" ("Id" TEXT NOT NULL CONSTRAINT "PK_AspNetRoles" PRIMARY KEY, "Name" TEXT NULL, "NormalizedName" TEXT NULL, "ConcurrencyStamp" TEXT NULL);
                CREATE TABLE "AspNetUsers" ("Id" TEXT NOT NULL CONSTRAINT "PK_AspNetUsers" PRIMARY KEY, "UserName" TEXT NULL, "NormalizedUserName" TEXT NULL, "Email" TEXT NULL, "NormalizedEmail" TEXT NULL, "EmailConfirmed" INTEGER NOT NULL, "PasswordHash" TEXT NULL, "SecurityStamp" TEXT NULL, "ConcurrencyStamp" TEXT NULL, "PhoneNumber" TEXT NULL, "PhoneNumberConfirmed" INTEGER NOT NULL, "TwoFactorEnabled" INTEGER NOT NULL, "LockoutEnd" TEXT NULL, "LockoutEnabled" INTEGER NOT NULL, "AccessFailedCount" INTEGER NOT NULL);
                CREATE TABLE "Categories" ("Id" INTEGER NOT NULL CONSTRAINT "PK_Categories" PRIMARY KEY AUTOINCREMENT, "Name" TEXT NOT NULL, "Slug" TEXT NOT NULL, "SortOrder" INTEGER NOT NULL);
                CREATE TABLE "ContactMessages" ("Id" INTEGER NOT NULL CONSTRAINT "PK_ContactMessages" PRIMARY KEY AUTOINCREMENT, "Name" TEXT NOT NULL, "Email" TEXT NOT NULL, "Phone" TEXT NULL, "Subject" TEXT NOT NULL, "Message" TEXT NOT NULL, "CreatedAtUtc" TEXT NOT NULL, "IsRead" INTEGER NOT NULL);
                CREATE TABLE "Services" ("Id" INTEGER NOT NULL CONSTRAINT "PK_Services" PRIMARY KEY AUTOINCREMENT, "Title" TEXT NOT NULL, "Description" TEXT NOT NULL, "PriceLabel" TEXT NULL, "IsPublished" INTEGER NOT NULL, "SortOrder" INTEGER NOT NULL);
                CREATE TABLE "SiteSettings" ("Id" INTEGER NOT NULL CONSTRAINT "PK_SiteSettings" PRIMARY KEY, "HeroTitle" TEXT NOT NULL, "HeroSubtitle" TEXT NOT NULL, "ShowreelUrl" TEXT NULL, "AboutText" TEXT NOT NULL, "ProfilePhotoUrl" TEXT NULL, "CvUrl" TEXT NULL, "ContactEmail" TEXT NOT NULL, "WhatsApp" TEXT NULL, "Telegram" TEXT NULL, "InstagramUrl" TEXT NULL, "YouTubeUrl" TEXT NULL, "TikTokUrl" TEXT NULL, "LinkedInUrl" TEXT NULL, "BehanceUrl" TEXT NULL, "Location" TEXT NOT NULL, "SeoTitle" TEXT NOT NULL, "SeoDescription" TEXT NOT NULL);
                CREATE TABLE "Testimonials" ("Id" INTEGER NOT NULL CONSTRAINT "PK_Testimonials" PRIMARY KEY AUTOINCREMENT, "ClientName" TEXT NOT NULL, "ClientTitle" TEXT NULL, "ClientImageUrl" TEXT NULL, "Quote" TEXT NOT NULL, "IsPublished" INTEGER NOT NULL, "SortOrder" INTEGER NOT NULL);
                CREATE TABLE "AspNetRoleClaims" ("Id" INTEGER NOT NULL CONSTRAINT "PK_AspNetRoleClaims" PRIMARY KEY AUTOINCREMENT, "RoleId" TEXT NOT NULL, "ClaimType" TEXT NULL, "ClaimValue" TEXT NULL, CONSTRAINT "FK_AspNetRoleClaims_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE);
                CREATE TABLE "AspNetUserClaims" ("Id" INTEGER NOT NULL CONSTRAINT "PK_AspNetUserClaims" PRIMARY KEY AUTOINCREMENT, "UserId" TEXT NOT NULL, "ClaimType" TEXT NULL, "ClaimValue" TEXT NULL, CONSTRAINT "FK_AspNetUserClaims_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE);
                CREATE TABLE "AspNetUserLogins" ("LoginProvider" TEXT NOT NULL, "ProviderKey" TEXT NOT NULL, "ProviderDisplayName" TEXT NULL, "UserId" TEXT NOT NULL, CONSTRAINT "PK_AspNetUserLogins" PRIMARY KEY ("LoginProvider", "ProviderKey"), CONSTRAINT "FK_AspNetUserLogins_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE);
                CREATE TABLE "AspNetUserRoles" ("UserId" TEXT NOT NULL, "RoleId" TEXT NOT NULL, CONSTRAINT "PK_AspNetUserRoles" PRIMARY KEY ("UserId", "RoleId"), CONSTRAINT "FK_AspNetUserRoles_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE, CONSTRAINT "FK_AspNetUserRoles_AspNetRoles_RoleId" FOREIGN KEY ("RoleId") REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE);
                CREATE TABLE "AspNetUserTokens" ("UserId" TEXT NOT NULL, "LoginProvider" TEXT NOT NULL, "Name" TEXT NOT NULL, "Value" TEXT NULL, CONSTRAINT "PK_AspNetUserTokens" PRIMARY KEY ("UserId", "LoginProvider", "Name"), CONSTRAINT "FK_AspNetUserTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE);
                CREATE TABLE "Projects" ("Id" INTEGER NOT NULL CONSTRAINT "PK_Projects" PRIMARY KEY AUTOINCREMENT, "Title" TEXT NOT NULL, "Slug" TEXT NOT NULL, "Description" TEXT NOT NULL, "Client" TEXT NULL, "Year" INTEGER NOT NULL, "VideoUrl" TEXT NOT NULL, "ThumbnailUrl" TEXT NULL, "Tools" TEXT NULL, "BeforeAfterUrl" TEXT NULL, "IsFeatured" INTEGER NOT NULL, "IsPublished" INTEGER NOT NULL, "SortOrder" INTEGER NOT NULL, "CategoryId" INTEGER NOT NULL, CONSTRAINT "FK_Projects_Categories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES "Categories" ("Id") ON DELETE RESTRICT);
                CREATE TABLE "RefreshTokens" ("Id" INTEGER NOT NULL CONSTRAINT "PK_RefreshTokens" PRIMARY KEY AUTOINCREMENT, "UserId" TEXT NOT NULL, "TokenHash" TEXT NOT NULL, "ExpiresAtUtc" TEXT NOT NULL, "RevokedAtUtc" TEXT NULL, "ReplacedByTokenHash" TEXT NULL, CONSTRAINT "FK_RefreshTokens_AspNetUsers_UserId" FOREIGN KEY ("UserId") REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE);
                CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName");
                CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");
                CREATE UNIQUE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");
                CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");
                CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");
                CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");
                CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName");
                CREATE UNIQUE INDEX "IX_Categories_Slug" ON "Categories" ("Slug");
                CREATE INDEX "IX_ContactMessages_CreatedAtUtc" ON "ContactMessages" ("CreatedAtUtc");
                CREATE INDEX "IX_Projects_CategoryId" ON "Projects" ("CategoryId");
                CREATE UNIQUE INDEX "IX_Projects_Slug" ON "Projects" ("Slug");
                CREATE UNIQUE INDEX "IX_RefreshTokens_TokenHash" ON "RefreshTokens" ("TokenHash");
                CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");
                INSERT INTO "SiteSettings" ("Id", "HeroTitle", "HeroSubtitle", "AboutText", "ContactEmail", "Location", "SeoTitle", "SeoDescription") VALUES (1, 'Demsew Andarge', 'Video Editor & Motion Storyteller', 'I shape raw footage into stories that move people.', 'hello@example.com', 'Ethiopia', 'Demsew Andarge — Video Editor', 'Cinematic video editing and motion storytelling.');
                """);
            return;
        }

        if (postgres)
        {
            migrationBuilder.Sql("""
                CREATE TABLE "AspNetRoles" ("Id" varchar(450) PRIMARY KEY, "Name" varchar(256), "NormalizedName" varchar(256), "ConcurrencyStamp" text);
                CREATE TABLE "AspNetUsers" ("Id" varchar(450) PRIMARY KEY, "UserName" varchar(256), "NormalizedUserName" varchar(256), "Email" varchar(256), "NormalizedEmail" varchar(256), "EmailConfirmed" boolean NOT NULL, "PasswordHash" text, "SecurityStamp" text, "ConcurrencyStamp" text, "PhoneNumber" text, "PhoneNumberConfirmed" boolean NOT NULL, "TwoFactorEnabled" boolean NOT NULL, "LockoutEnd" timestamp with time zone, "LockoutEnabled" boolean NOT NULL, "AccessFailedCount" integer NOT NULL);
                CREATE TABLE "Categories" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "Name" text NOT NULL, "Slug" varchar(100) NOT NULL, "SortOrder" integer NOT NULL);
                CREATE TABLE "ContactMessages" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "Name" text NOT NULL, "Email" text NOT NULL, "Phone" text, "Subject" text NOT NULL, "Message" text NOT NULL, "CreatedAtUtc" timestamp with time zone NOT NULL, "IsRead" boolean NOT NULL);
                CREATE TABLE "Services" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "Title" text NOT NULL, "Description" text NOT NULL, "PriceLabel" text, "IsPublished" boolean NOT NULL, "SortOrder" integer NOT NULL);
                CREATE TABLE "SiteSettings" ("Id" integer PRIMARY KEY, "HeroTitle" text NOT NULL, "HeroSubtitle" text NOT NULL, "ShowreelUrl" text, "AboutText" text NOT NULL, "ProfilePhotoUrl" text, "CvUrl" text, "ContactEmail" text NOT NULL, "WhatsApp" text, "Telegram" text, "InstagramUrl" text, "YouTubeUrl" text, "TikTokUrl" text, "LinkedInUrl" text, "BehanceUrl" text, "Location" text NOT NULL, "SeoTitle" text NOT NULL, "SeoDescription" text NOT NULL);
                CREATE TABLE "Testimonials" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "ClientName" text NOT NULL, "ClientTitle" text, "ClientImageUrl" text, "Quote" text NOT NULL, "IsPublished" boolean NOT NULL, "SortOrder" integer NOT NULL);
                CREATE TABLE "AspNetRoleClaims" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "RoleId" varchar(450) NOT NULL REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE, "ClaimType" text, "ClaimValue" text);
                CREATE TABLE "AspNetUserClaims" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "UserId" varchar(450) NOT NULL REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE, "ClaimType" text, "ClaimValue" text);
                CREATE TABLE "AspNetUserLogins" ("LoginProvider" varchar(128) NOT NULL, "ProviderKey" varchar(128) NOT NULL, "ProviderDisplayName" text, "UserId" varchar(450) NOT NULL REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE, PRIMARY KEY ("LoginProvider", "ProviderKey"));
                CREATE TABLE "AspNetUserRoles" ("UserId" varchar(450) NOT NULL REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE, "RoleId" varchar(450) NOT NULL REFERENCES "AspNetRoles" ("Id") ON DELETE CASCADE, PRIMARY KEY ("UserId", "RoleId"));
                CREATE TABLE "AspNetUserTokens" ("UserId" varchar(450) NOT NULL REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE, "LoginProvider" varchar(128) NOT NULL, "Name" varchar(128) NOT NULL, "Value" text, PRIMARY KEY ("UserId", "LoginProvider", "Name"));
                CREATE TABLE "Projects" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "Title" text NOT NULL, "Slug" varchar(180) NOT NULL, "Description" text NOT NULL, "Client" text, "Year" integer NOT NULL, "VideoUrl" text NOT NULL, "ThumbnailUrl" text, "Tools" text, "BeforeAfterUrl" text, "IsFeatured" boolean NOT NULL, "IsPublished" boolean NOT NULL, "SortOrder" integer NOT NULL, "CategoryId" integer NOT NULL REFERENCES "Categories" ("Id") ON DELETE RESTRICT);
                CREATE TABLE "RefreshTokens" ("Id" integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY, "UserId" varchar(450) NOT NULL REFERENCES "AspNetUsers" ("Id") ON DELETE CASCADE, "TokenHash" varchar(64) NOT NULL, "ExpiresAtUtc" timestamp with time zone NOT NULL, "RevokedAtUtc" timestamp with time zone, "ReplacedByTokenHash" varchar(64));
                CREATE UNIQUE INDEX "RoleNameIndex" ON "AspNetRoles" ("NormalizedName") WHERE "NormalizedName" IS NOT NULL;
                CREATE INDEX "IX_AspNetRoleClaims_RoleId" ON "AspNetRoleClaims" ("RoleId");
                CREATE INDEX "EmailIndex" ON "AspNetUsers" ("NormalizedEmail");
                CREATE INDEX "IX_AspNetUserClaims_UserId" ON "AspNetUserClaims" ("UserId");
                CREATE INDEX "IX_AspNetUserLogins_UserId" ON "AspNetUserLogins" ("UserId");
                CREATE INDEX "IX_AspNetUserRoles_RoleId" ON "AspNetUserRoles" ("RoleId");
                CREATE UNIQUE INDEX "UserNameIndex" ON "AspNetUsers" ("NormalizedUserName") WHERE "NormalizedUserName" IS NOT NULL;
                CREATE UNIQUE INDEX "IX_Categories_Slug" ON "Categories" ("Slug");
                CREATE INDEX "IX_ContactMessages_CreatedAtUtc" ON "ContactMessages" ("CreatedAtUtc");
                CREATE INDEX "IX_Projects_CategoryId" ON "Projects" ("CategoryId");
                CREATE UNIQUE INDEX "IX_Projects_Slug" ON "Projects" ("Slug");
                CREATE UNIQUE INDEX "IX_RefreshTokens_TokenHash" ON "RefreshTokens" ("TokenHash");
                CREATE INDEX "IX_RefreshTokens_UserId" ON "RefreshTokens" ("UserId");
                INSERT INTO "SiteSettings" ("Id", "HeroTitle", "HeroSubtitle", "AboutText", "ContactEmail", "Location", "SeoTitle", "SeoDescription") VALUES (1, 'Demsew Andarge', 'Video Editor & Motion Storyteller', 'I shape raw footage into stories that move people.', 'hello@example.com', 'Ethiopia', 'Demsew Andarge — Video Editor', 'Cinematic video editing and motion storytelling.');
                """);
            return;
        }

        throw new NotSupportedException($"Migration does not support provider '{ActiveProvider}'.");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        if (ActiveProvider.Contains("Sqlite", StringComparison.OrdinalIgnoreCase))
        {
            migrationBuilder.Sql("""
                DROP TABLE IF EXISTS "RefreshTokens"; DROP TABLE IF EXISTS "Projects";
                DROP TABLE IF EXISTS "AspNetUserTokens"; DROP TABLE IF EXISTS "AspNetUserRoles";
                DROP TABLE IF EXISTS "AspNetUserLogins"; DROP TABLE IF EXISTS "AspNetUserClaims";
                DROP TABLE IF EXISTS "AspNetRoleClaims"; DROP TABLE IF EXISTS "Testimonials";
                DROP TABLE IF EXISTS "SiteSettings"; DROP TABLE IF EXISTS "Services";
                DROP TABLE IF EXISTS "ContactMessages"; DROP TABLE IF EXISTS "Categories";
                DROP TABLE IF EXISTS "AspNetUsers"; DROP TABLE IF EXISTS "AspNetRoles";
                """);
            return;
        }

        if (ActiveProvider.Contains("Npgsql", StringComparison.OrdinalIgnoreCase))
        {
            migrationBuilder.Sql("""
                DROP TABLE "RefreshTokens"; DROP TABLE "Projects"; DROP TABLE "AspNetUserTokens";
                DROP TABLE "AspNetUserRoles"; DROP TABLE "AspNetUserLogins"; DROP TABLE "AspNetUserClaims";
                DROP TABLE "AspNetRoleClaims"; DROP TABLE "Testimonials"; DROP TABLE "SiteSettings";
                DROP TABLE "Services"; DROP TABLE "ContactMessages"; DROP TABLE "Categories";
                DROP TABLE "AspNetUsers"; DROP TABLE "AspNetRoles";
                """);
            return;
        }

        throw new NotSupportedException($"Migration does not support provider '{ActiveProvider}'.");
    }
}
