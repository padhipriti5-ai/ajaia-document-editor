using DocumentEditor.Api.Data;
using DocumentEditor.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DocumentEditor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DocumentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public DocumentsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/documents
    [HttpGet]
    public async Task<IActionResult> GetDocuments()
    {
        var documents = await _context.Documents
            .OrderByDescending(d => d.UpdatedAt)
            .ToListAsync();

        return Ok(documents);
    }

    // GET: api/documents/1
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDocument(int id)
    {
        var document = await _context.Documents.FindAsync(id);

        if (document == null)
        {
            return NotFound(new { message = "Document not found." });
        }

        return Ok(document);
    }

    // POST: api/documents
    [HttpPost]
    public async Task<IActionResult> CreateDocument(Document document)
    {
        if (string.IsNullOrWhiteSpace(document.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        document.CreatedAt = DateTime.UtcNow;
        document.UpdatedAt = DateTime.UtcNow;

        _context.Documents.Add(document);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetDocument),
            new { id = document.Id },
            document
        );
    }

    // PUT: api/documents/1
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateDocument(
        int id,
        Document updatedDocument)
    {
        var document = await _context.Documents.FindAsync(id);

        if (document == null)
        {
            return NotFound(new { message = "Document not found." });
        }

        if (string.IsNullOrWhiteSpace(updatedDocument.Title))
        {
            return BadRequest(new { message = "Title is required." });
        }

        document.Title = updatedDocument.Title;
        document.Content = updatedDocument.Content;
        document.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(document);
    }

    // DELETE: api/documents/1
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDocument(int id)
    {
        var document = await _context.Documents.FindAsync(id);

        if (document == null)
        {
            return NotFound(new { message = "Document not found." });
        }

        _context.Documents.Remove(document);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Document deleted successfully." });
    }
}