namespace DemsewPortfolio.Api.Interfaces;

public interface IFileStorage
{
    Task<string> SaveAsync(IFormFile file, string folder, CancellationToken cancellationToken);
}
