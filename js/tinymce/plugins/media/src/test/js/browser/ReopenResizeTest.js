asynctest('browser.core.PluginTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyDom',
	'ephox.mcagar.api.TinyApis',
	'ephox.mcagar.api.TinyUi',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.UiFinder',
	'ephox.agar.api.FocusTools',
	'ephox.agar.api.Step',
	'ephox.agar.api.Waiter',
	'ephox.agar.api.ApproxStructure',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader, TinyDom, TinyApis,
	TinyUi, Pipeline, UiFinder, FocusTools, Step, Waiter, ApproxStructure, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var videoWithWidth = function (width) {
		return ApproxStructure.build(function (s, str) {
			return s.element('body', {
				children: [
					s.element('img', {
						attrs: {
							width: str.is(width)
						}
					})
				]
			});
		});
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);
		var apis = TinyApis(editor);

		Pipeline.async({}, [
			Utils.sOpenDialog(ui),
			Utils.sPasteSourceValue(ui, 'a'),
			Step.wait(10),
			ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
			Utils.sOpenDialog(ui),
			Utils.sChangeWidthValue(ui, '500'),
			Step.wait(10),
			ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
			apis.sAssertContentStructure(videoWithWidth('500'))
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		forced_root_block: false
	}, success, failure);
});
