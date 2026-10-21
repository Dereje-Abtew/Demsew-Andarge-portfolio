using DemsewPortfolio.Api.Interfaces;

namespace DemsewPortfolio.Api.Services;

public sealed class LocalFileStorage(IWebHostEnvironment environment) : IFileStorage
{
    private static readonly HashSet<string> AllowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".pdf"];
    private const long MaxFileSize = 10 * 1024 * 1024;

    public async Task<string> SaveAsync(IFormFile file, string folder, CancellationToken cancellationToken)
    {
        if (file.Length is <= 0 or > MaxFileSize)
        {
            throw new ArgumentException("File must be between 1 byte and 10 MB.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!AllowedExtensions.Contains(extension))
        {
            throw new ArgumentException("Only JPG, PNG, WebP, and PDF uploads are supported.");
        }

        await using (var signatureStream = file.OpenReadStream())
        {
            var signature = new byte[12];
            var bytesRead = await signatureStream.ReadAsync(signature, cancellationToken);
            if (!HasValidSignature(extension, signature.AsSpan(0, bytesRead)))
                throw new ArgumentException("File content does not match its extension.");
        }

        if (folder is not ("images" or "documents"))
            throw new ArgumentException("Folder must be either 'images' or 'documents'.");

        var safeFolder = folder;
        var fileName = $"{Guid.NewGuid():N}{extension}";
        var directory = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads", safeFolder);
        Directory.CreateDirectory(directory);
        var destination = Path.Combine(directory, fileName);
        await using var stream = File.Create(destination);
        await file.CopyToAsync(stream, cancellationToken);
        return $"/uploads/{safeFolder}/{fileName}";
    }

    private static bool HasValidSignature(string extension, ReadOnlySpan<byte> bytes) => extension switch
    {
        ".jpg" or ".jpeg" => bytes.Length >= 3 && bytes[0] == 0xFF && bytes[1] == 0xD8 && bytes[2] == 0xFF,
        ".png" => bytes.Length >= 8 && bytes[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }),
        ".webp" => bytes.Length >= 12 && bytes[..4].SequenceEqual("RIFF"u8) && bytes[8..12].SequenceEqual("WEBP"u8),
        ".pdf" => bytes.Length >= 5 && bytes[..5].SequenceEqual("%PDF-"u8),
        _ => false
    };
}
