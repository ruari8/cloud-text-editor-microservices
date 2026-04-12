<?php
echo "Integration Tests Starting\n\n";

$tests_run = 0;
$tests_passed = 0;

function runTest($name, $url, $expected_status, $expected_response, $method = 'POST', $data = null) {
    global $tests_run, $tests_passed;
    $tests_run++;
    
    echo "Test $tests_run: $name\n";
    
    $opts = [
        'http' => [
            'method' => $method,
            'ignore_errors' => true,
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n"
        ]
    ];

    // Add POST data if provided
    if ($data && $method === 'POST') {
        $opts['http']['content'] = http_build_query($data);
    }
    
    $context = stream_context_create($opts);
    
    $response = file_get_contents($url, false, $context);
    
    if ($response === false) {
        echo "✗ Failed: Could not connect to server\n";
        return;
    }
    
    $status = $http_response_header[0];
    preg_match('/HTTP\/\d\.\d\s+(\d+)/', $status, $matches);
    $status_code = intval($matches[1]);
    
    $passed = true;
    $errors = [];
    
    // Check status code
    if ($status_code !== $expected_status) {
        $passed = false;
        $errors[] = "Expected status $expected_status, got $status_code";
    }
    
    // Check response body
    $response_data = json_decode($response, true);
    if ($response_data !== $expected_response) {
        $passed = false;
        $errors[] = "Response mismatch:\nExpected: " . json_encode($expected_response) . 
                   "\nGot: " . json_encode($response_data);
    }
    
    if ($passed) {
        echo "✓ Passed\n";
        $tests_passed++;
    } else {
        echo "✗ Failed:\n" . implode("\n", $errors) . "\n";
    }
    echo "\n";
}

$base_url = "http://localhost:80";

// Test valid POST request
runTest(
    "Valid POST request",
    "$base_url/",
    200,
    ["error" => false, "string" => "Contains 2 words", "answer" => 2],
    'POST',
    ['text' => 'hello world']
);

// Test wrong method (GET)
runTest(
    "Wrong method (GET)",
    "$base_url/",
    405,
    ["error" => true, "message" => "Method not allowed. Use POST instead."],
    'GET'
);

// Test missing parameter
runTest(
    "Missing parameter",
    "$base_url/",
    400,
    ["error" => true, "message" => "Text parameter is required"],
    'POST'
);

// Test empty string
runTest(
    "Empty string",
    "$base_url/",
    400,
    ["error" => true, "message" => "Text cannot be empty or whitespace only"],
    'POST',
    ['text' => '']
);

// Test whitespace only
runTest(
    "Whitespace only",
    "$base_url/",
    400,
    ["error" => true, "message" => "Text cannot be empty or whitespace only"],
    'POST',
    ['text' => '   ']
);

// Test special characters
runTest(
    "Special characters",
    "$base_url/",
    200,
    ["error" => false, "string" => "Contains 2 words", "answer" => 2],
    'POST',
    ['text' => 'hello! world?']
);

// Test text too long
runTest(
    "Text too long",
    "$base_url/",
    400,
    ["error" => true, "message" => "Text exceeds maximum length of 10000 characters"],
    'POST',
    ['text' => str_repeat('a', 10001)]
);

runTest(
    "Health check endpoint",
    "$base_url/health",
    200,
    [
        "status" => "healthy"
    ],
    'GET'
);


// Summary
echo "\nTests Complete: $tests_passed/$tests_run passed\n";
if ($tests_passed !== $tests_run) {
    exit(1);
}
exit(0);