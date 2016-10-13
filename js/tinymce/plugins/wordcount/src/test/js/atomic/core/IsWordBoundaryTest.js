test('atomic.core.IsWordBoundaryTest', [
	'tinymce.wordcount.text.StringMapper',
	'tinymce.wordcount.text.IsWordBoundary'
], function (StringMapper, IsWordBoundary) {

	var sm = StringMapper;

	assert.eq(false, IsWordBoundary(sm('ab'), 0));
	assert.eq(true, IsWordBoundary(sm('ab'), 1));
	assert.eq(false, IsWordBoundary(sm('abc'), 1));


});