test('atomic.core.WordGetterTest', [
	'tinymce.wordcount.text.WordGetter'
], function (WordGetter) {
	assert.eq(['hello', 'world'], WordGetter('hello world'));
	assert.eq(['the', 'price', 'is', '3,500.50'], WordGetter('the price is 3,500.50'));
	assert.eq(['僕', 'の', '名', '前', 'は', 'マティアス'], WordGetter('僕の名前はマティアス'));
	assert.eq(['a', 'b'], WordGetter('a .... ......   ....... ... b'));
	assert.eq(['a', ' ', 'b'], WordGetter('a b', {includeWhitespace: true}));

});