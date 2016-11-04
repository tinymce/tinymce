asynctest('browser.core.SubmitTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyUi',
	'ephox.mcagar.api.TinyApis',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.Waiter',
	'ephox.agar.api.Chain',
	'ephox.agar.api.ApproxStructure',
	'ephox.agar.api.GeneralSteps',
	'ephox.agar.api.Step',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader,
	TinyUi, TinyApis, Pipeline, Waiter, Chain, ApproxStructure, GeneralSteps, Step, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var sSetSetting = function (editorSetting, key, value) {
		return Step.sync(function () {
			editorSetting[key] = value;
		});
	};

	var sTestPlaceholder = function (ui, editor, apis, url, expected, struct) {
		return GeneralSteps.sequence([
			Utils.sOpenDialog(ui),
			Utils.sSetFormItemNoEvent(ui, url),
			ui.sClickOnUi('click checkbox', 'div.mce-primary > button'),
			Utils.sAssertEditorContent(apis, editor, expected),
			Waiter.sTryUntil('blabla',
				apis.sAssertContentStructure(struct),
			10, 500),
			apis.sSetContent('')
		]);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);
		var apis = TinyApis(editor);

		var placeholderStructure = ApproxStructure.build(function (s) {
			return s.element('body', {
				children: [
					s.element('p', {
						children: [
							s.element('img', {})
						]
					}),
					s.element('div', {}),
					s.element('div', {}),
					s.element('div', {}),
					s.element('div', {})
				]
			});
		});

		var iframeStructure = ApproxStructure.build(function (s) {
			return s.element('body', {
				children: [
					s.element('p', {
						children: [
							s.element('span', {
								children: [
									s.element('iframe', {}),
									s.element('span', {})
								]
							}),
							s.anything()
						]
					})
				]
			});
		});

		Pipeline.async({}, [
			sSetSetting(editor.settings, 'media_live_embeds', false),
			sTestPlaceholder(ui, editor, apis,
				'https://www.youtube.com/watch?v=P_205ZY52pY',
				'<p><iframe src="//www.youtube.com/embed/P_205ZY52pY" width="560" ' +
				'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
				placeholderStructure),
			sSetSetting(editor.settings, 'media_live_embeds', true),
			sTestPlaceholder(ui, editor, apis,
				'https://www.youtube.com/watch?v=P_205ZY52pY',
				'<p><iframe src="//www.youtube.com/embed/P_205ZY52pY" width="560" ' +
				'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
				iframeStructure),
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		// media_embed_handler: function (data, resolve) {
		// 	setTimeout(function () {
		// 		resolve({
		// 			html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'
		// 		});
		// 	}, 500);
		// }
	}, success, failure);

});