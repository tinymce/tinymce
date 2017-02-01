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
	'ephox.agar.api.RawAssertions',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader, TinyDom, TinyApis,
	TinyUi, Pipeline, UiFinder, FocusTools, Step, Waiter, ApproxStructure, RawAssertions, Utils
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
					}),
					s.anything(),
					s.anything(),
					s.anything(),
					s.anything()
				]
			});
		});
	};

	var sWaitForResizeHandles = function (editor) {
		return Waiter.sTryUntil('Wait for new width value', Step.sync(function () {
			RawAssertions.assertEq('Resize handle should exist', editor.dom.select('#mceResizeHandlenw').length, 1);
		}), 1, 3000);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);
		var apis = TinyApis(editor);

		Pipeline.async({}, [
			Utils.sOpenDialog(ui),
			Utils.sPasteSourceValue(ui, 'a'),
			Utils.sAssertWidthValue(ui, '300'),
			ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
			sWaitForResizeHandles(editor),
			Utils.sOpenDialog(ui),
			Utils.sChangeWidthValue(ui, '500'),
			ui.sClickOnUi('Click on close button', 'button:contains("Ok")'),
			sWaitForResizeHandles(editor),
			apis.sAssertContentStructure(videoWithWidth('500'))
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		forced_root_block: false
	}, success, failure);
});
