// tests/unit_tests.php
<?php
require_once(__DIR__ . '/../functions.inc.php');

echo "Unit Tests Starting\n\n";

// Test tracking
$tests_run = 0;
$tests_passed = 0;

function runTest($name, $test, $expected, $input = null) {
    global $tests_run, $tests_passed;
    $tests_run++;
    
    echo "Test $tests_run: $name\n";
    try {
        $result = $test();
        if ($result === $expected) {
            echo "✓ Passed\n";
            $tests_passed++;
        } else {
            echo "✗ Failed: Expected $expected, got $result\n";
            if ($input !== null) {
                echo "Input was: '$input'\n";
            }
        }
    } catch (Exception $e) {
        if ($expected === 'exception') {
            echo "✓ Passed (Expected exception: {$e->getMessage()})\n";
            $tests_passed++;
        } else {
            echo "✗ Failed: Unexpected exception: {$e->getMessage()}\n";
        }
    }
    echo "\n";
}

// Happy Path Tests
runTest("Basic word count", 
    fn() => wordcount("hello world"), 
    2, 
    "hello world"
);

runTest("Multiple spaces between words", 
    fn() => wordcount("hello    world"), 
    2, 
    "hello    world"
);

// Edge Cases
runTest("Numbers in text", 
    fn() => wordcount("hello 123 world"), 
    3, 
    "hello 123 world"
);

runTest("Special characters", 
    fn() => wordcount("hello! world? test."), 
    3, 
    "hello! world? test."
);

// Error Cases
runTest("Empty string", 
    fn() => wordcount(""), 
    'exception'
);

runTest("Whitespace only", 
    fn() => wordcount("   "), 
    'exception'
);

runTest("Non-string input (null)", 
    fn() => wordcount(null), 
    'exception'
);

runTest("Non-string input (array)", 
    fn() => wordcount([]), 
    'exception'
);

// Summary
echo "\nTests Complete: $tests_passed/$tests_run passed\n";
if ($tests_passed !== $tests_run) {
    exit(1);
}
exit(0);