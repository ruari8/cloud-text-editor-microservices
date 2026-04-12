module.exports = {
    counter: function(text) {
        if (typeof text !== 'string') {
            throw new Error('Input must be a string');
        }
        return text.length;
    }
}
