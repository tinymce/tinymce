test('atomic.core.WordGetterTest', [
	'tinymce.wordcount.text.WordGetter'
], function (WordGetter) {
	var getWords = WordGetter.getWords;

	var testGetWords = function() {
		// splits words on whitespace
		assert.eq(['hello', 'world'], getWords('hello world'));
		// does not split on numeric separators
		assert.eq(['the', 'price', 'is', '3,500.50'], getWords('the price is 3,500.50'));
		// does not split on katakana words
		assert.eq(['僕', 'の', '名', '前', 'は', 'マティアス'], getWords('僕の名前はマティアス'));
		// removes punctuation by default
		assert.eq(['a', 'b'], getWords('a .... b'));
		//  but keeps with setting
		assert.eq(['a', '.', '.', '.', '.', 'b'], getWords('a .... b', {includePunctuation: true}));
		// keeps whitespace with setting
		assert.eq(['a', ' ', ' ', ' ', 'b'], getWords('a   b', {includeWhitespace: true}));
		// ignores case with setting
		assert.eq(['hello', 'world'], getWords('HELLO World', {ignoreCase: true}));
	};

	testGetWords();
});