import unittest
from unittest.mock import patch, MagicMock
from rewrite import app
import json

class TestRewriteAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Set up the Flask test client"""
        cls.client = app.test_client()
        cls.client.testing = True

    def setUp(self):
        """Set up test cases that will be used multiple times"""
        self.valid_payload = {
            "text": "Hello world",
            "style": "Shakespearean"
        }
        self.empty_payload = {
            "style": "Shakespearean"
        }

    @patch("rewrite.client.chat.completions.create")
    def test_rewrite_api_success(self, mock_create):
        """Test successful API call with coherent text"""
        # Mock both the coherence check and rewrite calls
        mock_create.side_effect = [
            MagicMock(choices=[MagicMock(message=MagicMock(content="Yes"))]),
            MagicMock(choices=[MagicMock(message=MagicMock(content="Verily, I say unto thee, greetings world!"))])
        ]

        response = self.client.post(
            "/rewrite",
            data=json.dumps(self.valid_payload),
            content_type="application/json"
        )
        
        data = response.get_json()
        self.assertEqual(response.status_code, 200)
        self.assertIn("rewritten_text", data)
        self.assertEqual(data["rewritten_text"], "Verily, I say unto thee, greetings world!")

    def test_rewrite_api_missing_text(self):
        """Test API response when text is missing from request"""
        response = self.client.post(
            "/rewrite",
            data=json.dumps(self.empty_payload),
            content_type="application/json"
        )
        
        data = response.get_json()
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "No input text provided")

    def test_rewrite_api_invalid_json(self):
        """Test API response with invalid JSON payload"""
        response = self.client.post(
            "/rewrite",
            data="invalid json",
            content_type="application/json"
        )
        
        data = response.get_json()
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Invalid JSON payload")

    def test_health_check(self):
        """Test health check endpoint returns 200"""
        response = self.client.get('/health')
        data = response.get_json()
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(data["status"], "healthy")

if __name__ == "__main__":
    unittest.main()