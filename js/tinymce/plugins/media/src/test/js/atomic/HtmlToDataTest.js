test('atomic.core.HtmlToDataTest', [
	'ephox/tinymce',
	'tinymce.media.core.HtmlToData',
	'ephox.agar.api.RawAssertions'
], function (tinymce, HtmlToData, RawAssertions) {
	var testHtmlToData = function (html, expected) {
		var actual = HtmlToData.htmlToData([], html);
		RawAssertions.assertEq('Assert equal', expected, actual);
	};
	testHtmlToData('<video data-ephox-embed-iri="a" src="b.mp4"></video>', {
		type: 'ephox-embed-iri',
		source1: 'a',
		source2: '',
		poster: ''
	});

	testHtmlToData('<iframe src="//www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>', {
		src: "//www.youtube.com/embed/b3XFjWInBog",
		width: "560",
		height: "314",
		allowfullscreen: "1",
		type: "iframe",
		source1: "//www.youtube.com/embed/b3XFjWInBog",
		source2: "",
		poster: ""
	});

	testHtmlToData('<div data-ephox-embed-iri="a"><img src="b" alt="c"></div>', {
		source1: 'a',
		type: 'ephox-embed-iri',
		poster: '',
		source2: ''
	});

	testHtmlToData('<span data-ephox-embed-iri="a"><img src="b" alt="c"></span>', {
		source1: 'a',
		poster: '',
		source2: '',
		type: 'ephox-embed-iri'
	});
});