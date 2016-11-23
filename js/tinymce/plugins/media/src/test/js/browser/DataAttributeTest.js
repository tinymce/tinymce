asynctest('browser.core.DataAttributeTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyUi',
	'ephox.agar.api.GeneralSteps',
	'ephox.agar.api.Pipeline',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader,
	TinyUi, GeneralSteps, Pipeline, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var sTestEmbedContentFromUrlWithAttribute = function (ui, url, content) {
		return GeneralSteps.sequence([
			Utils.sOpenDialog(ui),
			Utils.sSetFormItemPaste(ui, url),
			Utils.sAssertEmbedContent(ui, content),
			Utils.sSubmitAndReopen(ui),
			Utils.sAssertSourceValue(ui, url),
			Utils.sCloseDialog(ui)
		]);
	};
	var sTestEmbedContentFromUrl2 = function (ui, url, url2, content, content2) {
		return GeneralSteps.sequence([
			Utils.sOpenDialog(ui),
			Utils.sSetFormItemPaste(ui, url),
			Utils.sAssertEmbedContent(ui, content),
			Utils.sSubmitAndReopen(ui),
			Utils.sAssertSourceValue(ui, url),
			Utils.sSetFormItemPaste(ui, url2),
			Utils.sAssertEmbedContent(ui, content2),
			Utils.sCloseDialog(ui)
		]);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);

		Pipeline.async({}, [
			sTestEmbedContentFromUrlWithAttribute(ui,
				'a',
				'<video data-ephox-embed-iri="a"' +
				' width="300" height="150" controls="controls">\n' +
				'<source src="embed-a" />\n</video>'
			),
			sTestEmbedContentFromUrl2(ui, 'a', 'b',
				'<video data-ephox-embed-iri="a"' +
				' width="300" height="150" controls="controls">\n' +
				'<source src="embed-a" />\n</video>',
				'<video data-ephox-embed-iri="b"' +
				' width="300" height="150" controls="controls">\n' +
				'<source src="embed-b" />\n</video>'
			),
			Utils.sTestEmbedContentFromUrl(ui,
				'a',
				'<video data-ephox-embed-iri="a" width="300" height="150" controls="controls">\n' +
				'<source src="embed-a" />\n</video>'
			),
			Utils.sAssertSizeRecalcConstrained(ui),
			Utils.sAssertSizeRecalcUnconstrained(ui),
			Utils.sAssertSizeRecalcConstrainedReopen(ui)
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		media_url_resolver: function (data, resolve) {
			resolve({
				html: '<video data-ephox-embed-iri="' + data.url + '" width="300" height="150" ' +
					'controls="controls">\n<source src="' + 'embed-' + data.url + '" />\n</video>'});
		}
	}, success, failure);
});