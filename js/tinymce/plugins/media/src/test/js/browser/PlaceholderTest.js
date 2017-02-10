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

	var sTestPlaceholder = function (ui, editor, apis, url, expected, struct) {
		return GeneralSteps.sequence([
			Utils.sOpenDialog(ui),
			Utils.sSetFormItemNoEvent(ui, url),
			ui.sClickOnUi('click checkbox', 'div.mce-primary > button'),
			Utils.sAssertEditorContent(apis, editor, expected),
			Waiter.sTryUntil('Wait for structure check',
				apis.sAssertContentStructure(struct),
			10, 500),
			apis.sSetContent('')
		]);
	};

	var sTestScriptPlaceholder = function (ui, editor, apis, expected, struct) {
		return GeneralSteps.sequence([
			apis.sSetContent(
				'<script src="http://media1.tinymce.com/123456"></script>' +
				'<script src="http://media2.tinymce.com/123456"></script>'),
			Waiter.sTryUntil('Wait for structure check',
				apis.sAssertContentStructure(struct),
			10, 500),
			Utils.sAssertEditorContent(apis, editor, expected),
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

		var scriptStruct = ApproxStructure.build(function (s, str, arr) {
			return s.element('body', {
				children: [
					s.element('img', {
						classes: [
							arr.has('mce-object', 'mce-object-script')
						],
						attrs: {
							height: str.is('150'),
							width: str.is('300')
						}
					}),
					s.element('img', {
						classes: [
							arr.has('mce-object', 'mce-object-script')
						],
						attrs: {
							height: str.is('200'),
							width: str.is('100')
						}
					})
				]
			});
		});

		Pipeline.async({}, [
			Utils.sSetSetting(editor.settings, 'media_live_embeds', false),
			sTestScriptPlaceholder(ui, editor, apis,
			'<p>\n' +
				'<script src="http://media1.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
				'<script src="http://media2.tinymce.com/123456" type="text/javascript"></sc' + 'ript>\n' +
			'</p>', scriptStruct),
			sTestPlaceholder(ui, editor, apis,
				'https://www.youtube.com/watch?v=P_205ZY52pY',
				'<p><iframe src="//www.youtube.com/embed/P_205ZY52pY" width="560" ' +
				'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
				placeholderStructure),
			Utils.sSetSetting(editor.settings, 'media_live_embeds', true),
			sTestPlaceholder(ui, editor, apis,
				'https://www.youtube.com/watch?v=P_205ZY52pY',
				'<p><iframe src="//www.youtube.com/embed/P_205ZY52pY" width="560" ' +
				'height="314" allowfullscreen="allowfullscreen"></iframe></p>',
				iframeStructure)
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media",
		extended_valid_elements: 'script[src|type]',
		media_scripts: [
			{filter: 'http://media1.tinymce.com'},
			{filter: 'http://media2.tinymce.com', width: 100, height: 200}
		]
	}, success, failure);

});