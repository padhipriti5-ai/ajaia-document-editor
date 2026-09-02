using DocumentEditor.Api.Data;
using DocumentEditor.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocumentEditor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentSharesController : ControllerBase
{
    private readonly AppDbContext _context;

    public DocumentSharesController(AppDbContext context)
    {
        _context = context;
    }

    // Share a document
    [HttpPost]
    public async Task<IActionResult> ShareDocument(DocumentShare share)
    {
        if (share.DocumentId <= 0)
        {
            return BadRequest(new { message = "Document ID is required." });
        }

        if (string.IsNullOrWhiteSpace(share.SharedWithEmail))
        {
            return BadRequest(new { message = "Email is required." });
        }

        if (share.Permission != "View" && share.Permission != "Edit")
        {
            return BadRequest(new { message = "Permission must be View or Edit." });
        }

        var document = await _context.Documents.FindAsync(share.DocumentId);

        if (document == null)
        {
            return NotFound(new { message = "Document not found." });
        }

        share.ShareToken = Guid.NewGuid().ToString("N");
        share.CreatedAt = DateTime.UtcNow;

        _context.DocumentShares.Add(share);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Document shared successfully.",
            shareId = share.Id,
            email = share.SharedWithEmail,
            permission = share.Permission,
            shareToken = share.ShareToken,
            shareUrl = $"/shared/{share.ShareToken}"
        });
    }

    // Get shares for a document
    [HttpGet("document/{documentId}")]
    public async Task<IActionResult> GetDocumentShares(int documentId)
    {
        var shares = await _context.DocumentShares
            .Where(s => s.DocumentId == documentId)
            .ToListAsync();

        return Ok(shares);
    }

    // Remove sharing access
    [HttpDelete("{id}")]
    public async Task<IActionResult> RemoveShare(int id)
    {
        var share = await _context.DocumentShares.FindAsync(id);

        if (share == null)
        {
            return NotFound(new { message = "Share not found." });
        }

        _context.DocumentShares.Remove(share);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Access removed successfully." });
    }
}