test('atomic.core.WordGetterTest', [
	'tinymce.wordcount.text.WordGetter'
], function (WordGetter) {
	var getWords = WordGetter.getWords;

	var testGetWords = function() {
		assert.eq(['hello', 'world'], getWords('hello world'));
		assert.eq(['the', 'price', 'is', '3,500.50'], getWords('the price is 3,500.50'));
		assert.eq(['僕', 'の', '名', '前', 'は', 'マティアス'], getWords('僕の名前はマティアス'));
		assert.eq(['a', 'b'], getWords('a .... ......   ....... ... b'));
		assert.eq(['a', ' ', 'b'], getWords('a b', {includeWhitespace: true}));
		assert.eq([], getWords(''));
	};

	testGetWords();
});