const expect = require('chai').expect;
const charcount = require('../charcount');

describe('Character Counter Unit Tests', () => {
    describe('Happy Path', () => {
        it('should count basic string length', () => {
            expect(charcount.counter('hello world')).to.equal(11);
        });

        it('should handle single character', () => {
            expect(charcount.counter('a')).to.equal(1);
        });

        it('should count spaces', () => {
            expect(charcount.counter('   ')).to.equal(3);
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty string', () => {
            expect(charcount.counter('')).to.equal(0);
        });

        it('should handle special characters', () => {
            expect(charcount.counter('!@#$%^&*()')).to.equal(10);
        });

        it('should handle numbers', () => {
            expect(charcount.counter('123456789')).to.equal(9);
        });

        it('should handle unicode characters', () => {
            expect(charcount.counter('Hello 世界')).to.equal(8);
        });

        it('should handle newlines and tabs', () => {
            expect(charcount.counter('hello\nworld\t!')).to.equal(13);
        });
    });

    describe('Error Cases', () => {
        it('should handle null input', () => {
            expect(() => charcount.counter(null)).to.throw();
        });

        it('should handle undefined input', () => {
            expect(() => charcount.counter(undefined)).to.throw();
        });

        it('should handle non-string input', () => {
            expect(() => charcount.counter(123)).to.throw();
        });
    });
});