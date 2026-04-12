package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
)

// Test function for the HTTP handler
func TestWordFrequencyHandler(t *testing.T) {
	// Create test request body
	requestBody := Request{
		Text: "hello world hello",
	}
	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		t.Fatalf("Failed to marshal request body: %v", err)
	}

	// Create a test HTTP request
	req := httptest.NewRequest(http.MethodPost, "/frequency", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	// Call the handler function
	wordFrequencyHandler(rec, req)

	// Check the HTTP status code
	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status 200 but got %v", rec.Code)
	}

	// Parse the JSON response
	var response Response
	err = json.NewDecoder(rec.Body).Decode(&response)
	if err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	// Check the response content
	expectedFrequencies := map[string]int{"hello": 2, "world": 1}
	if !reflect.DeepEqual(response.Frequencies, expectedFrequencies) {
		t.Errorf("Expected frequencies %v but got %v", expectedFrequencies, response.Frequencies)
	}
}

// Test for missing text in request body
func TestMissingText(t *testing.T) {
	// Create empty request body
	requestBody := Request{
		Text: "",
	}
	bodyBytes, err := json.Marshal(requestBody)
	if err != nil {
		t.Fatalf("Failed to marshal request body: %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/frequency", bytes.NewBuffer(bodyBytes))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	wordFrequencyHandler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("Expected status 400 but got %v", rec.Code)
	}
}

// Test for invalid HTTP method
func TestInvalidMethod(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/frequency", nil)
	rec := httptest.NewRecorder()

	wordFrequencyHandler(rec, req)

	if rec.Code != http.StatusMethodNotAllowed {
		t.Fatalf("Expected status 405 but got %v", rec.Code)
	}
}

// Test for invalid JSON body
func TestInvalidJSON(t *testing.T) {
	invalidJSON := []byte(`{"text": invalid json}`)

	req := httptest.NewRequest(http.MethodPost, "/frequency", bytes.NewBuffer(invalidJSON))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	wordFrequencyHandler(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("Expected status 400 but got %v", rec.Code)
	}
}

func TestHealthCheck(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rec := httptest.NewRecorder()

	healthCheckHandler(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("Expected status 200 but got %v", rec.Code)
	}

	var response map[string]string
	err := json.NewDecoder(rec.Body).Decode(&response)
	if err != nil {
		t.Fatalf("Failed to parse JSON response: %v", err)
	}

	if response["status"] != "healthy" {
		t.Errorf("Expected status 'healthy' but got '%v'", response["status"])
	}
}
