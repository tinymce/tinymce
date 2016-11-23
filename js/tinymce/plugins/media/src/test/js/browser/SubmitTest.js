asynctest('browser.core.SubmitTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyUi',
	'ephox.mcagar.api.TinyApis',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.Waiter',
	'ephox.agar.api.Chain',
	'ephox.agar.api.Assertions',
	'ephox.agar.api.GeneralSteps',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader,
	TinyUi, TinyApis, Pipeline, Waiter, Chain, Assertions, GeneralSteps, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var sTestEmbedContentSubmit = function (ui, editor, apis, url, expected) {
		return GeneralSteps.sequence([
			Utils.sOpenDialog(ui),
			Utils.sSetFormItemNoEvent(ui, url),
			ui.sClickOnUi('click checkbox', 'div.mce-primary > button'),
			Utils.sAssertEditorContent(apis, editor, expected)
		]);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);
		var apis = TinyApis(editor);

		Pipeline.async({}, [
			sTestEmbedContentSubmit(ui, editor, apis, 'https://www.youtube.com/watch?v=IcgmSRJHu_8',
			'<p><span id="fake">https://www.youtube.com/watch?v=IcgmSRJHu_8</span></p>'),
			apis.sSetContent(''),
			Utils.sSetSetting(editor.settings, 'media_url_resolver', function (data, resolve) {
				resolve({html: ''});
			}),
			sTestEmbedContentSubmit(ui, editor, apis, 'https://www.youtube.com/watch?v=IcgmSRJHu_8',
			'<p><iframe src="//www.youtube.com/embed/IcgmSRJHu_8" width="560" height="314" ' +
				'allowfullscreen="allowfullscreen"></iframe></p>'),
			apis.sSetContent('')
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		media_url_resolver: function (data, resolve) {
			setTimeout(function () {
				resolve({
					html: '<span id="fake">' + data.url + '</span>'
				});
			}, 500);
		}
	}, success, failure);
});