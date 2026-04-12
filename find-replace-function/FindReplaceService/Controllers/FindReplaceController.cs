using Microsoft.AspNetCore.Mvc;

namespace FindReplaceService.Controllers;

[ApiController]
[Route("[controller]")]
public class FindReplaceController : ControllerBase
{   
    [HttpGet("health")]
    public IActionResult HealthCheck()
    {
        return Ok(new { status = "healthy" });
    }

    [HttpPost("replace")]
    public IActionResult ReplaceText([FromBody] FindReplaceRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.InputText) || 
                string.IsNullOrEmpty(request.FindWord) || 
                string.IsNullOrEmpty(request.ReplaceWord))
            {
                return BadRequest("Input text, find word, and replace word cannot be empty.");
            }

            string result = request.InputText.Replace(request.FindWord, request.ReplaceWord);
            
            return Ok(new FindReplaceResponse 
            { 
                ProcessedText = result 
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"An error occurred while processing the text: {ex.Message}");
        }
    }
}

// You can put these classes in the same file for now
// In a larger project, we'd typically put them in separate files
public class FindReplaceRequest
{
    public string InputText { get; set; } = string.Empty;
    public string FindWord { get; set; } = string.Empty;
    public string ReplaceWord { get; set; } = string.Empty;
}

public class FindReplaceResponse
{
    public string ProcessedText { get; set; } = string.Empty;
}