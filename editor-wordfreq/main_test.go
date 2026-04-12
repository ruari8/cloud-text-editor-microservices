package main

import (
	"reflect"
	"testing"
)

// Test function for word frequency counting logic
func TestWordFrequency(t *testing.T) {
	tests := []struct {
		input    string
		expected map[string]int
	}{
		{"hello world hello", map[string]int{"hello": 2, "world": 1}},
		{"Go is fun", map[string]int{"go": 1, "is": 1, "fun": 1}},
		{"", map[string]int{}},
		{"a a a b b", map[string]int{"a": 3, "b": 2}},
		{"my email is test@gmail.com", map[string]int{
			"my":             1,
			"email":          1,
			"is":             1,
			"test@gmail.com": 1,
		}},
		{"send me $50 for petrol", map[string]int{
			"send":   1,
			"me":     1,
			"$50":    1,
			"for":    1,
			"petrol": 1,
		}},
		{"buy petrol, asap.", map[string]int{
			"buy":    1,
			"petrol": 1,
			"asap":   1,
		}},
	}

	for _, test := range tests {
		result := countWordFrequencies(test.input)
		if !reflect.DeepEqual(result, test.expected) {
			t.Errorf("For input '%s', expected %v but got %v", test.input, test.expected, result)
		}
	}
}

func TestWordFrequency_EmptySpaces(t *testing.T) {
	input := "     "
	expected := map[string]int{}
	result := countWordFrequencies(input)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("For input '%s', expected %v but got %v", input, expected, result)
	}
}
