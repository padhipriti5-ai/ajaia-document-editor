namespace DocumentEditor.Api.Models;

public class DocumentShare
{
    public int Id { get; set; }

    public int DocumentId { get; set; }

    public string SharedWithEmail { get; set; } = string.Empty;

    public string Permission { get; set; } = "View";

    public string ShareToken { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}