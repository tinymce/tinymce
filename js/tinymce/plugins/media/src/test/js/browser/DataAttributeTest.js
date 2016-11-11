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

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);

		Pipeline.async({}, [
			sTestEmbedContentFromUrlWithAttribute(ui,
				'https://www.youtube.com/watch?v=b3XFjWInBog',
				'<video data-ephox-embed="https://www.youtube.com/watch?v=b3XFjWInBog" width="300" height="150" controls="controls">\n' +
				'<source src="weirdEmbedUrl" />\n</video>'
			),
			Utils.sTestEmbedContentFromUrl(ui,
				'https://www.google.com',
				'<video data-ephox-embed="https://www.google.com" width="300" height="150" controls="controls">\n' +
				'<source src="weirdEmbedUrl" />\n</video>'
			),
			Utils.sAssertSizeRecalcConstrained(ui),
			Utils.sAssertSizeRecalcUnconstrained(ui),
			Utils.sAssertSizeRecalcConstrainedReopen(ui)
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		media_embed_handler: function (data, resolve) {
			resolve({
				html: '<video data-ephox-embed="' + data.url + '" width="300" height="150" ' +
					'controls="controls">\n<source src="weirdEmbedUrl" />\n</video>'});
		}
	}, success, failure);
});