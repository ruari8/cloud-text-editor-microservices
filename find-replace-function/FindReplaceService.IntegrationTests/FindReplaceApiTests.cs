using System.Net;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using FindReplaceService;

namespace FindReplaceService.IntegrationTests;

public class FindReplaceApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public FindReplaceApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ReplaceEndpoint_WithValidRequest_ReturnsSuccessAndReplacedText()
    {
        var client = _factory.CreateClient();
        var request = new
        {
            InputText = "hi hi friend",
            FindWord = "hi",
            ReplaceWord = "hey"
        };
        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync("/FindReplace/replace", jsonContent);
        var responseString = await response.Content.ReadAsStringAsync();
        var responseData = JsonSerializer.Deserialize<Dictionary<string, string>>(responseString);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(responseData);
        Assert.Contains("processedText", responseData.Keys);
        Assert.Equal("hey hey friend", responseData["processedText"]);
    }

    [Fact]
    public async Task ReplaceEndpoint_WithEmptyInput_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var request = new
        {
            InputText = "",
            FindWord = "hi",
            ReplaceWord = "hey"
        };
        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync("/FindReplace/replace", jsonContent);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReplaceEndpoint_WithInvalidJson_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var invalidJson = "{invalid json}";
        var jsonContent = new StringContent(
            invalidJson,
            Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync("/FindReplace/replace", jsonContent);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReplaceEndpoint_WithMissingFields_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var request = new
        {
            InputText = "hello world"
            // Missing FindWord and ReplaceWord
        };
        var jsonContent = new StringContent(
            JsonSerializer.Serialize(request),
            Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync("/FindReplace/replace", jsonContent);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReplaceEndpoint_WithWrongHttpMethod_ReturnsMethodNotAllowed()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/FindReplace/replace");  // Using GET instead of POST

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
    }

    [Fact]
    public async Task HealthCheck_ReturnsOk()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/FindReplace/health");
        var responseString = await response.Content.ReadAsStringAsync();
        var responseData = JsonSerializer.Deserialize<Dictionary<string, string>>(responseString);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(responseData);
        Assert.Contains("status", responseData.Keys);
        Assert.Equal("healthy", responseData["status"]);
    }
}