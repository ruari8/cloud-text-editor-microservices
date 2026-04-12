# Use the official Python image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Expose the port Flask will run on
EXPOSE 80

# Set the environment variable for Flask
ENV FLASK_ENV=production

# Run the Flask application
CMD ["python", "rewrite.py"]
