package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
)

// Response structure to return JSON data
type Response struct {
	Error       bool           `json:"error"`
	Message     string         `json:"message"`
	Frequencies map[string]int `json:"frequencies"`
}

// Request structure to receive text
type Request struct {
	Text string `json:"text"`
}

func countWordFrequencies(text string) map[string]int {
	validWordRegex := regexp.MustCompile(`\b[\w@.]+\b|\$[\d]+`)
	matches := validWordRegex.FindAllString(text, -1)

	wordCounts := make(map[string]int)
	for _, word := range matches {
		normalizedWord := strings.ToLower(word)
		wordCounts[normalizedWord]++
	}
	return wordCounts
}

func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "healthy",
	})
}

// Handler function for word frequency detection
func wordFrequencyHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight (OPTIONS) requests
	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse JSON request body
	var req Request
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate text
	if req.Text == "" {
		http.Error(w, "Text cannot be empty", http.StatusBadRequest)
		return
	}

	// Count word frequencies
	wordCounts := countWordFrequencies(req.Text)

	// Prepare the response
	response := Response{
		Error:       false,
		Message:     "Word frequency calculated successfully",
		Frequencies: wordCounts,
	}

	// Set response headers and write the JSON response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/health", healthCheckHandler)
	http.HandleFunc("/frequency", wordFrequencyHandler)
	fmt.Println("Starting server on port 80...")
	http.ListenAndServe(":80", nil)
}
