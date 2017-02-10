asynctest('browser.core.MediaEmbedTest', [
	'global!tinymce',
	'tinymce.media.Plugin',
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyUi',
	'ephox.mcagar.api.TinyApis',
	'ephox.agar.api.Assertions',
	'ephox.sugar.api.node.Element',
	'ephox.agar.api.ApproxStructure',
	'ephox.agar.api.Step',
	'ephox.agar.api.Pipeline',
	'tinymce.media.test.Utils'
], function (
	tinymce, Plugin, TinyLoader,
	TinyUi, TinyApis, Assertions, Element, ApproxStructure, Step, Pipeline, Utils
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var ephoxEmbedStructure = ApproxStructure.build(function (s, str/*, arr*/) {
		return s.element('p', {
			children: [
				s.element('div', {
					children: [
						s.element('iframe', {
							attrs: {
								src: str.is('about:blank')
							}
						})
					],
					attrs: {
						'data-ephox-embed-iri': str.is('embed-iri'),
						'contenteditable': str.is('false')
					}
				})
			]
		});
	});

	var sAssertDivStructure = function (editor, expected) {
		return Step.sync(function () {
			var actual = Element.fromHtml(editor.dom.select('div')[0].outerHTML);
			return Assertions.sAssertStructure('Should be the same structure', expected, actual);
		});
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var ui = TinyUi(editor);
		var apis = TinyApis(editor);

		Pipeline.async({}, [
			apis.sSetContent('<div contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>'),
			sAssertDivStructure(editor, ephoxEmbedStructure),
			apis.sSelect('div', []),
			Utils.sOpenDialog(ui),
			Utils.sAssertSourceValue(ui, 'embed-iri'),
			Utils.sAssertEmbedContent(ui,
				'<div contenteditable="false" data-ephox-embed-iri="embed-iri">' +
					'<iframe src="about:blank"></iframe>' +
				'</div>'
			),
			Utils.sSubmitDialog(ui),
			sAssertDivStructure(editor, ephoxEmbedStructure)
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
