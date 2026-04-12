<?php
function wordcount($text) {
    if (!is_string($text)) {
        throw new InvalidArgumentException('Input must be a string');
    }

    if (trim($text) === '') {
        throw new InvalidArgumentException('Text cannot be empty or whitespace only');
    }

    return count(preg_split('/\s+/', trim($text)));
}