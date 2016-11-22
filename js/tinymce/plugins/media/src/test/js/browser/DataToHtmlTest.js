asynctest('browser.core.DataToHtmlTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.Step',
	'ephox.agar.api.Waiter',
	'ephox.agar.api.Assertions',
	'ephox.sugar.api.Element',
	'ephox.agar.api.ApproxStructure',
	'tinymce.media.test.Utils',
	'tinymce.media.core.DataToHtml'
], function (
	tinymce, Plugin, TinyLoader,
	Pipeline, Step, Waiter, Assertions, Element, ApproxStructure, Utils, DataToHtml
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var sTestDataToHtml = function (editor, data, expected) {
		var actual = Element.fromHtml(DataToHtml.dataToHtml(editor, data));

		return Waiter.sTryUntil('Wait for structure check',
				Assertions.sAssertStructure('Assert equal', expected, actual),
			10, 500);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {

		var videoStruct = ApproxStructure.build(function (s, str/*, arr*/) {
			return s.element('video', {
				children: [
					s.text(str.is('\n')),
					s.element('source', {
						attrs: {
							src: str.is('a')
						}
					}),
					s.text(str.is('\n'))
				],
				attrs: {
					height: str.is('150'),
					width: str.is('300')
				}
			});
		});

		var iframeStruct = ApproxStructure.build(function (s, str/*, arr*/) {
			return s.element('iframe', {
				attrs: {
					height: str.is('150'),
					width: str.is('300')
				}
			});
		});

		Pipeline.async({}, [
			sTestDataToHtml(editor,
				{
					type: 'video',
					source1: 'a',
					source2: '',
					poster: '',
					"data-ephox-embed": 'a'
				},
				videoStruct),
			sTestDataToHtml(editor,
				{
					type: 'iframe',
					source1: 'a',
					source2: '',
					poster: '',
					"data-ephox-embed": 'a'
				},
				iframeStruct)
		], onSuccess, onFailure);
	}, {
		plugins: ["media"],
		toolbar: "media"
	}, success, failure);
});
