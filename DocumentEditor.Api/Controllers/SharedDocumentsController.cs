using DocumentEditor.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocumentEditor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SharedDocumentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public SharedDocumentsController(AppDbContext context)
    {
        _context = context;
    }

    // Open a shared document using share token
    [HttpGet("{token}")]
    public async Task<IActionResult> GetSharedDocument(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return BadRequest(new { message = "Share token is required." });
        }

        var share = await _context.DocumentShares
            .FirstOrDefaultAsync(s => s.ShareToken == token);

        if (share == null)
        {
            return NotFound(new { message = "Invalid or expired share link." });
        }

        var document = await _context.Documents
            .FindAsync(share.DocumentId);

        if (document == null)
        {
            return NotFound(new { message = "Document not found." });
        }

        return Ok(new
        {
            document.Id,
            document.Title,
            document.Content,
            document.UpdatedAt,
            permission = share.Permission,
            sharedWithEmail = share.SharedWithEmail
        });
    }
    [HttpPut("{token}")]
    public async Task<IActionResult> UpdateSharedDocument(
    string token,
    [FromBody] UpdateSharedDocumentRequest request)
    {
        var share = await _context.DocumentShares
            .FirstOrDefaultAsync(s => s.ShareToken == token);

        if (share == null)
        {
            return NotFound(new { message = "Invalid or expired share link." });
        }

        if (share.Permission != "Edit")
        {
            return StatusCode(403, new
            {
                message = "You only have view permission."
            });
        }

        var document = await _context.Documents
            .FindAsync(share.DocumentId);

        if (document == null)
        {
            return NotFound(new { message = "Document not found." });
        }

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        document.Title = request.Title.Trim();
        document.Content = request.Content ?? string.Empty;
        document.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Document updated successfully.",
            document
        });
    }

    public class UpdateSharedDocumentRequest
    {
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}