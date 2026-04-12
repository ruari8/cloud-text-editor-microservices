<?php
$config = require('config.php');
header("Access-Control-Allow-Origin: " . $config['cors_origin']);
header("Content-Type: application/json; charset=UTF-8");
require('functions.inc.php');

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $path === '/health') {
    http_response_code(200);
    echo json_encode([
        "status" => "healthy"
    ]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Methods: " . $config['allowed_method']);
    header("Access-Control-Allow-Headers: Content-Type");
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== $config['allowed_method']) {
    http_response_code(405);
    echo json_encode([
        "error" => true,
        "message" => "Method not allowed. Use " . $config['allowed_method'] . " instead."
    ]);
    exit();
}

try {
    if (!isset($_POST['text'])) {
        http_response_code(400);
        echo json_encode([
            "error" => true,
            "message" => "Text parameter is required"
        ]);
        exit();
    }

    $text = $_POST['text'];

	if (strlen($text) > $config['max_text_length']) {
        http_response_code(400);
        echo json_encode([
            "error" => true,
            "message" => "Text exceeds maximum length of " . $config['max_text_length'] . " characters"
        ]);
        exit();
    }
    
    try {
        $answer = wordcount($text);
        
        echo json_encode([
            "error" => false,
            "string" => "Contains " . $answer . " words",
            "answer" => $answer
        ]);
        
    } catch (InvalidArgumentException $e) {
        http_response_code(400);
        echo json_encode([
            "error" => true,
            "message" => $e->getMessage()
        ]);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "error" => true,
        "message" => "Internal server error"
    ]);
}