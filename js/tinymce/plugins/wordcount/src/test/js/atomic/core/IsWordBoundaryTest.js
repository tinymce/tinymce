test('atomic.core.WordBoundaryTest', [
	'tinymce.wordcount.text.StringMapper',
	'tinymce.wordcount.text.WordBoundary'
], function (StringMapper, WordBoundary) {
	var sm = StringMapper.classify;

	var testWordBoundary = function() {
		assert.eq(false, WordBoundary.isWordBoundary(sm('ab'), 0));
		assert.eq(true, WordBoundary.isWordBoundary(sm('ab'), 1));
		assert.eq(false, WordBoundary.isWordBoundary(sm('abc'), 1));
	};

	testWordBoundary();
});