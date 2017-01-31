asynctest('browser.core.PluginTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyDom',
	'ephox.mcagar.api.TinyApis',
	'ephox.mcagar.api.TinyUi',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.UiFinder',
	'ephox.agar.api.Step',
	'ephox.agar.api.Waiter',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader, TinyDom, TinyApis,
	TinyUi, Pipeline, UiFinder, Step, Waiter, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);

		Pipeline.async({}, [
			Utils.sOpenDialog(ui),
			ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
			Waiter.sTryUntil(
				'Wait for dialog to close',
				UiFinder.sNotExists(TinyDom.fromDom(document.body), 'div[aria-label="Insert/edit media"][role="dialog"]'),
				50, 5000
			)

		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		media_dimensions: false
	}, success, failure);
});
