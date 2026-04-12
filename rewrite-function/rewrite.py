from openai import OpenAI
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.errorhandler(400)
def bad_request(error):
    return jsonify({"error": "Invalid request payload"}), 400

def check_text_coherence(input_text):
    """Check if the input text is coherent and can be restyled"""
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a text analyzer. Respond with only 'Yes' or 'No'."},
                {"role": "user", "content": f"Is the following text coherent and readable, suitable for being rewritten in a different style? Answer only Yes or No:\n\n{input_text}"}
            ]
        )
        result = response.choices[0].message.content.strip().lower()
        return result == 'yes'
    except Exception:
        return False

def rewrite_text(input_text, style):
    """Rewrites the input text using the specified style."""
    try:
        # First check if text is coherent
        if not check_text_coherence(input_text):
            return "Error: Input text appears to be incoherent or unsuitable for restyling"

        # If coherent, proceed with rewriting
        prompt = f"Rewrite the following text in {style} style:\n\n{input_text}"

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are an expert text rewriter."},
                {"role": "user", "content": prompt}
            ]
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: OpenAI API error: {str(e)}"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/rewrite', methods=['POST'])
def rewrite_api():
    try:
        data = request.get_json()
    except Exception:
        return jsonify({"error": "Invalid JSON payload"}), 400
        
    if not data:
        return jsonify({"error": "Empty request payload"}), 400
        
    input_text = data.get("text", "")
    style = data.get("style", "Shakespearean")

    if not input_text:
        return jsonify({"error": "No input text provided"}), 400

    try:
        rewritten_text = rewrite_text(input_text, style)
        if rewritten_text.startswith("Error: Input text appears"):
            return jsonify({"error": rewritten_text[7:]}), 400
        return jsonify({"rewritten_text": rewritten_text}), 200
    except Exception as e:
        return jsonify({f"Error: {str(e)}"}), 400

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)