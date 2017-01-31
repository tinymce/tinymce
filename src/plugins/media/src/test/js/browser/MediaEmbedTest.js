asynctest('browser.core.MediaEmbedTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyUi',
	'ephox.mcagar.api.TinyApis',
	'ephox.agar.api.Pipeline',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader,
	TinyUi, TinyApis, Pipeline, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);
		var api = TinyApis(editor);

		Pipeline.async({}, [
			Utils.sTestEmbedContentFromUrl(ui,
				'https://www.youtube.com/watch?v=b3XFjWInBog',
				'<video width="300" height="150" controls="controls">\n' +
				'<source src="https://www.youtube.com/watch?v=b3XFjWInBog" />\n</video>'
			),
			Utils.sTestEmbedContentFromUrl(ui,
				'https://www.google.com',
				'<video width="300" height="150" controls="controls">\n' +
				'<source src="https://www.google.com" />\n</video>'
			),
			Utils.sAssertSizeRecalcConstrained(ui),
			Utils.sAssertSizeRecalcUnconstrained(ui),
			api.sSetContent(''),
			Utils.sAssertSizeRecalcConstrainedReopen(ui)
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		media_url_resolver: function (data, resolve) {
			resolve({
				html: '<video width="300" height="150" ' +
					'controls="controls">\n<source src="' + data.url + '" />\n</video>'});
		}
	}, success, failure);
});
