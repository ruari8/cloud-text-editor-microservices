import unittest
from unittest.mock import patch, MagicMock
from rewrite import rewrite_text

class TestRewriteTextFunction(unittest.TestCase):

    def setUp(self):
        """Set up test cases that will be used multiple times"""
        self.coherent_text = "This is a coherent sentence."
        self.incoherent_text = "asdf jkl123 qwer%% random!!!"
        self.style = "Shakespearean"

    @patch("rewrite.client.chat.completions.create")
    def test_coherent_text_rewrite(self, mock_create):
        """Test successful rewrite of coherent text"""
        # First mock call (coherence check) returns 'Yes'
        # Second mock call (rewrite) returns the rewritten text
        mock_create.side_effect = [
            MagicMock(choices=[MagicMock(message=MagicMock(content="Yes"))]),
            MagicMock(choices=[MagicMock(message=MagicMock(content="Rewritten text"))])
        ]

        result = rewrite_text(self.coherent_text, self.style)
        self.assertEqual(result, "Rewritten text")
        self.assertEqual(mock_create.call_count, 2)

    @patch("rewrite.client.chat.completions.create")
    def test_incoherent_text_rewrite(self, mock_create):
        """Test rejection of incoherent text"""
        # Mock coherence check returns 'No'
        mock_create.return_value = MagicMock(
            choices=[MagicMock(message=MagicMock(content="No"))]
        )

        result = rewrite_text(self.incoherent_text, self.style)
        self.assertTrue(result.startswith("Error: Input text appears to be incoherent"))
        # Verify only coherence check was called, not rewrite
        self.assertEqual(mock_create.call_count, 1)

    @patch("rewrite.client.chat.completions.create")
    def test_openai_error_during_coherence_check(self, mock_create):
        """Test handling of API error during coherence check"""
        mock_create.side_effect = Exception("API error")
        
        result = rewrite_text(self.coherent_text, self.style)
        self.assertTrue(result.startswith("Error: Input text appears to be incoherent"))
        self.assertEqual(mock_create.call_count, 1)

    @patch("rewrite.client.chat.completions.create")
    def test_openai_error_during_rewrite(self, mock_create):
        """Test handling of API error during rewrite"""
        # First call (coherence check) succeeds, second call (rewrite) fails
        mock_create.side_effect = [
            MagicMock(choices=[MagicMock(message=MagicMock(content="Yes"))]),
            Exception("API error")
        ]
        
        result = rewrite_text(self.coherent_text, self.style)
        self.assertTrue(result.startswith("Error: OpenAI API error"))
        self.assertEqual(mock_create.call_count, 2)

    @patch("rewrite.client.chat.completions.create")
    def test_empty_response_from_openai(self, mock_create):
        """Test handling of empty response from OpenAI"""
        # Mock coherence check returns 'Yes' but rewrite returns empty string
        mock_create.side_effect = [
            MagicMock(choices=[MagicMock(message=MagicMock(content="Yes"))]),
            MagicMock(choices=[MagicMock(message=MagicMock(content=""))])
        ]
        
        result = rewrite_text(self.coherent_text, self.style)
        self.assertEqual(result, "")
        self.assertEqual(mock_create.call_count, 2)

if __name__ == "__main__":
    unittest.main()