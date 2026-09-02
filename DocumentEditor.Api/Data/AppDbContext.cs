using DocumentEditor.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DocumentEditor.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Document> Documents { get; set; }
    public DbSet<DocumentShare> DocumentShares { get; set; }
}