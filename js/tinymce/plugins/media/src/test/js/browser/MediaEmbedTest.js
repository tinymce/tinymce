asynctest('browser.core.MediaEmbedTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyDom',
	'ephox.mcagar.api.TinyUi',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.GeneralSteps',
	'ephox.agar.api.Waiter',
	'ephox.agar.api.Step',
	'ephox.agar.api.Chain',
	'ephox.agar.api.UiFinder',
	'ephox.agar.api.UiControls',
	'ephox.agar.api.Assertions',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader, TinyDom,
	TinyUi, Pipeline, GeneralSteps,	Waiter,
	Step, Chain, UiFinder, UiControls, Assertions, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);

		Pipeline.async({}, [
			Utils.sAssertEmbedContentFromUrl(ui,
				'https://www.youtube.com/watch?v=b3XFjWInBog',
				'<video width="300" height="150" controls="controls">\n' +
				'<source src="https://www.youtube.com/watch?v=b3XFjWInBog" />\n</video>'
			),
			Utils.sAssertEmbedContentFromUrl(ui,
				'https://www.google.com',
				'<video width="300" height="150" controls="controls">\n' +
				'<source src="https://www.google.com" />\n</video>'
			)
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		media_embed_handler: function (data, resolve) {
			resolve({
				html: '<video width="300" height="150" ' +
					'controls="controls">\n<source src="' + data.url + '" />\n</video>'});
		}
	}, success, failure);
});
