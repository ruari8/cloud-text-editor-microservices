class EditorAPI {
    static async makeRequest(url, text, additionalData = {}, useJson = false) {
        try {
            let body;
            let headers = {};
            
            if (useJson) {
                // For services expecting JSON (like Rust, Go)
                const payload = {
                    ...(text !== null ? {text: text} : {}),
                    ...additionalData
                };
                body = JSON.stringify(payload);
                headers['Content-Type'] = 'application/json';
            } else {
                // For PHP services expecting form data
                const formData = new URLSearchParams();
                formData.append('text', text);
                for (const [key, value] of Object.entries(additionalData)) {
                    formData.append(key, value);
                }
                body = formData;
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async getWordCount(text) {
        return this.makeRequest(API_CONFIG.wordcount, text, {}, false); // PHP service - use form data
    }

    static async getCharCount(text) {
        return this.makeRequest(API_CONFIG.charcount, text, {}, true); // Node service - use JSON
    }

    static async rewriteText(text, style) {
        return this.makeRequest(
            `${API_CONFIG.rewrite}`, 
            text, 
            { style },
            true  // Python service - use JSON
        );
    }

    static async getWordFrequency(text) {
        return this.makeRequest(API_CONFIG.wordfreq, text, {}, true); // Go service - use JSON
    }

    static async getAverageWordLength(text) {
        return this.makeRequest(API_CONFIG.averageLength, text, {}, true); // Rust service - use JSON
    }

    static async findReplace(text, findWord, replaceWord) {
        console.log(`findReplace: ${text}, ${findWord}, ${replaceWord}`);
        return this.makeRequest(
            `${API_CONFIG.findReplace}`,
            null,
            {
                InputText: text,
                FindWord: findWord,
                ReplaceWord: replaceWord
            },
            true
        );
    }

    static async saveText(text) {
        return this.makeRequest(
            API_CONFIG.save,
            null,
            { content: text },
            true
        );
    }

    static async loadText(id) {
        try {
            const response = await fetch(`${API_CONFIG.load}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Load text failed:', error);
            throw error;
        }
    }
}