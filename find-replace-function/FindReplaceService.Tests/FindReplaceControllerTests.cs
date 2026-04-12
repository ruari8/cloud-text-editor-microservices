using Xunit;
using FindReplaceService.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace FindReplaceService.Tests;

public class FindReplaceControllerTests
{
    private readonly FindReplaceController _controller;

    public FindReplaceControllerTests()
    {
        _controller = new FindReplaceController();
    }

    [Fact]
    public void ReplaceText_WithValidInput_ReturnsOkResult()
    {
        var request = new FindReplaceRequest
        {
            InputText = "hi hi friend",
            FindWord = "hi",
            ReplaceWord = "hey"
        };

        var result = _controller.ReplaceText(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<FindReplaceResponse>(okResult.Value);
        Assert.Equal("hey hey friend", response.ProcessedText);
    }

    [Fact]
    public void ReplaceText_WithEmptyInput_ReturnsBadRequest()
    {
        var request = new FindReplaceRequest
        {
            InputText = "",
            FindWord = "hi",
            ReplaceWord = "hey"
        };

        var result = _controller.ReplaceText(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Theory]
    [InlineData("hello world", "hello", "hi", "hi world")]
    [InlineData("test test test", "test", "check", "check check check")]
    [InlineData("no matches here", "xyz", "abc", "no matches here")]
    [InlineData("CaseSensitive", "case", "test", "CaseSensitive")]  // Should not replace due to case sensitivity
    public void ReplaceText_WithVariousInputs_ReturnsExpectedResults(
        string inputText, string findWord, string replaceWord, string expected)
    {
        var request = new FindReplaceRequest
        {
            InputText = inputText,
            FindWord = findWord,
            ReplaceWord = replaceWord
        };

        var result = _controller.ReplaceText(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<FindReplaceResponse>(okResult.Value);
        Assert.Equal(expected, response.ProcessedText);
    }

    [Theory]
    [InlineData("", "find", "replace")]
    [InlineData("input", "", "replace")]
    [InlineData("input", "find", "")]
    public void ReplaceText_WithInvalidInputs_ReturnsBadRequest(
        string inputText, string findWord, string replaceWord)
    {
        var request = new FindReplaceRequest
        {
            InputText = inputText,
            FindWord = findWord,
            ReplaceWord = replaceWord
        };

        var result = _controller.ReplaceText(request);

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public void ReplaceText_WithLargeInput_CompletesSuccessfully()
    {
        var largeInput = new string('a', 1000000);  // 1 million 'a' characters
        var request = new FindReplaceRequest
        {
            InputText = largeInput,
            FindWord = "a",
            ReplaceWord = "b"
        };

        var result = _controller.ReplaceText(request);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<FindReplaceResponse>(okResult.Value);
        Assert.Equal(1000000, response.ProcessedText.Length);
        Assert.DoesNotContain("a", response.ProcessedText);
        Assert.Equal(new string('b', 1000000), response.ProcessedText);
    }
}