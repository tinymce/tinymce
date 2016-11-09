test('atomic.core.HtmlToDataTest', [
	'ephox/tinymce',
	'tinymce.media.core.HtmlToData',
	'ephox.agar.api.RawAssertions'
], function (tinymce, HtmlToData, RawAssertions) {
	var testHtmlToData = function (html, expected) {
		var actual = HtmlToData.htmlToData([], html);
		RawAssertions.assertEq('Assert equal', expected, actual);
	};
	testHtmlToData('<video data-ephox-embed="a" src="b.mp4"></video>', {
		src: 'text.mp4',
		type: 'video',
		source1: 'a',
		source2: '',
		poster: ''
	});
});