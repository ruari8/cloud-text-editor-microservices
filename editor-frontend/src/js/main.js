document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const contentInput = document.getElementById('editor-textarea');
    const resultsContainer = document.getElementById('results-container');
    
    // State
    let selectedStyle = 'Shakespeare';

    // Helper functions
    function showLoading() {
        resultsContainer.innerHTML = '<div class="loading">Processing...</div>';
    }

    function showError(message) {
        resultsContainer.innerHTML = `<div class="error">${message}</div>`;
    }

    function showResult(result) {
        if (typeof result === 'string') {
            resultsContainer.innerHTML = result;
        } else if (result.answer !== undefined) {
            resultsContainer.innerHTML = result.answer;
        } else if (result.rewritten_text) {
            resultsContainer.innerHTML = result.rewritten_text;
        } else if (result.frequencies) {
            const formatted = Object.entries(result.frequencies)
                .map(([word, count]) => `${word}: ${count}`)
                .join(',<br>');
            resultsContainer.innerHTML = formatted;
        } else if (result.average_length !== undefined) {
            resultsContainer.innerHTML = 
                `Average Word Length: ${result.average_length.toFixed(2)}`;
        } else if (result.processedText) {
            contentInput.value = result.processedText;
            resultsContainer.innerHTML = 'Text has been updated with replacements';
        } else if (result.id) {
            resultsContainer.innerHTML = `Text saved successfully! Your ID is: ${result.id}`;
        } else if (result.content) {
            contentInput.value = result.content;
            resultsContainer.innerHTML = 'Text loaded successfully!';
        }
    }

    function setStyle(style) {
        selectedStyle = style;
        document.querySelectorAll('.style-option').forEach(option => {
            option.classList.remove('selected');
            if (option.textContent === style) {
                option.classList.add('selected');
            }
        });
    }

    // Event handlers
    async function handleRequest(apiCall, errorMessage) {
        if (!contentInput.value.trim()) {
            showError('Please enter some text first');
            return;
        }

        showLoading();
        try {
            const result = await apiCall();
            showResult(result);
        } catch (error) {
            showError(errorMessage);
            console.error(error);
        }
    }

    // Set initial style
    setStyle(selectedStyle);

    // Attach event listeners
    document.getElementById('wordcount-btn').addEventListener('click', () => 
        handleRequest(
            () => EditorAPI.getWordCount(contentInput.value),
            'Failed to count words. Please try again.'
        )
    );

    document.getElementById('charcount-btn').addEventListener('click', () =>
        handleRequest(
            () => EditorAPI.getCharCount(contentInput.value),
            'Failed to count characters. Please try again.'
        )
    );

    document.getElementById('rewrite-btn').addEventListener('click', () =>
        handleRequest(
            () => EditorAPI.rewriteText(contentInput.value, selectedStyle),
            'Failed to rewrite text. Please try again.'
        )
    );

    document.getElementById('frequency-btn').addEventListener('click', () =>
        handleRequest(
            () => EditorAPI.getWordFrequency(contentInput.value),
            'Failed to analyze word frequency. Please try again.'
        )
    );

    document.getElementById('wordlength-btn').addEventListener('click', () =>
        handleRequest(
            () => EditorAPI.getAverageWordLength(contentInput.value),
            'Failed to calculate average word length. Please try again.'
        )
    );

    document.getElementById('findreplace-btn').addEventListener('click', () => {
        const findText = document.getElementById('find-input')?.value || '';
        const replaceText = document.getElementById('replace-input')?.value || '';

        if (!contentInput.value.trim()) {
            showError('Please enter some text first');
            return;
        }

        if (!findText.trim()) {
            showError('Please enter text to find');
            return;
        }

        if (!replaceText.trim()) {
            showError('Please enter replacement text');
            return;
        }

        handleRequest(
            () => EditorAPI.findReplace(
                contentInput.value, 
                findText,
                replaceText
            ),
            'Failed to perform find/replace operation. Please try again.'
        );
    });

    document.getElementById('save-btn').addEventListener('click', () => {
        if (!contentInput.value.trim()) {
            showError('Please enter some text to save');
            return;
        }

        handleRequest(
            async () => {
                const result = await EditorAPI.saveText(contentInput.value);
                // Show the ID in results container
                return `Text saved successfully! Your ID is: ${result.id}`;
            },
            'Failed to save text. Please try again.'
        );
    });

    document.getElementById('load-btn').addEventListener('click', () => {
        const loadId = document.getElementById('load-id')?.value;
        
        if (!loadId?.trim()) {
            showError('Please enter a text ID to load');
            return;
        }

        handleRequest(
            async () => {
                const result = await EditorAPI.loadText(loadId);
                if (result.content) {
                    contentInput.value = result.content;
                    return 'Text loaded successfully!';
                }
                throw new Error('No content found');
            },
            'Failed to load text. Please check your ID and try again.'
        );
    });

    // Set up style options
    document.querySelectorAll('.style-option').forEach(option => {
        option.addEventListener('click', (e) => setStyle(e.target.textContent));
    });
});