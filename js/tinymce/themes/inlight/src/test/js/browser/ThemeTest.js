asynctest('browser/core/ThemeTest', [
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyApis',
	'ephox.mcagar.api.TinyDom',
	'tinymce/inlight/Theme',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.Chain',
	'ephox.agar.api.UiFinder',
	'ephox.agar.api.Mouse',
	'ephox.agar.api.GeneralSteps',
	'ephox.agar.api.UiControls'
], function (TinyLoader, TinyApis, TinyDom, Theme, Pipeline, Chain, UiFinder, Mouse, GeneralSteps, UiControls) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var dialogRoot = TinyDom.fromDom(document.body);

	var cWaitForContextToolbar = Chain.fromChainsWith(dialogRoot, [
		UiFinder.cWaitForState('label', '.mce-tinymce-inline', function () {
			return true;
		})
	]);

	var cClickToolbarButton = function (ariaLabel) {
		return Chain.fromChains([
			UiFinder.cFindIn('div[aria-label="' + ariaLabel + '"]'),
			Mouse.cTrueClick
		]);
	};

	var sClickContextButton = function (ariaLabel) {
		return Chain.asStep({}, [
			cWaitForContextToolbar,
			cClickToolbarButton(ariaLabel)
		]);
	};

	var sBoldTests = function (tinyApis) {
		return GeneralSteps.sequence([
			tinyApis.sSetContent('<p>a</p>'),
			tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
			sClickContextButton('Bold'),
			tinyApis.sAssertContent('<p><strong>a</strong></p>')
		]);
	};

	var sH2Tests = function (tinyApis) {
		return GeneralSteps.sequence([
			tinyApis.sSetContent('<p>a</p>'),
			tinyApis.sSetSelection([0, 0], 0, [0, 0], 1),
			sClickContextButton('Heading 2'),
			tinyApis.sAssertContent('<h2>a</h2>')
		]);
	};

	var sInsertLink = function (url) {
		return Chain.asStep({}, [
			cWaitForContextToolbar,
			cClickToolbarButton('Insert/Edit link'),
			cWaitForContextToolbar,
			UiFinder.cFindIn('input'),
			UiControls.cSetValue(url),
			cWaitForContextToolbar,
			cClickToolbarButton('Ok')
		]);
	};

	var sUnlink = function () {
		return Chain.asStep({}, [
			cWaitForContextToolbar,
			cClickToolbarButton('Insert/Edit link'),
			cWaitForContextToolbar,
			cClickToolbarButton('Remove link')
		]);
	};

	var sLinkTests = function (tinyApis) {
		var sLinkTest = function (inputHtml, spath, soffset, fpath, foffset, url, expectedHtml) {
			return GeneralSteps.sequence([
				tinyApis.sSetContent(inputHtml),
				tinyApis.sSetSelection(spath, soffset, fpath, foffset),
				sInsertLink(url),
				tinyApis.sAssertContent(expectedHtml)
			]);
		};

		var sUnlinkTest = function (inputHtml, spath, soffset, fpath, foffset, expectedHtml) {
			return GeneralSteps.sequence([
				tinyApis.sSetContent(inputHtml),
				tinyApis.sSetSelection(spath, soffset, fpath, foffset),
				sUnlink(),
				tinyApis.sAssertContent(expectedHtml)
			]);
		};

		return GeneralSteps.sequence([
			sLinkTest('<p>a</p>', [0, 0], 0, [0, 0], 1, '#1', '<p><a href="#1">a</a></p>'),
			sLinkTest('<p><a id="x" href="#1">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '#2', '<p><a id="x" href="#2">a</a></p>'),
			sLinkTest('<p><a href="#3">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '', '<p>a</p>'),
			sUnlinkTest('<p><a id="x" href="#1">a</a></p>', [0, 0, 0], 0, [0, 0, 0], 1, '<p>a</p>')
		]);
	};

	var sInsertTableTests = function (tinyApis) {
		return GeneralSteps.sequence([
			tinyApis.sSetContent('<p><br></p><p>b</p>'),
			tinyApis.sSetCursor([0], 0),
			sClickContextButton('Insert table'),
			tinyApis.sAssertContent([
					'<table style="width: 100%;">',
						'<tbody>',
							'<tr>',
								'<td>&nbsp;</td>',
								'<td>&nbsp;</td>',
							'</tr>',
							'<tr>',
								'<td>&nbsp;</td>',
								'<td>&nbsp;</td>',
							'</tr>',
						'</tbody>',
					'</table>',
					'<p>b</p>'
				].join('\n')
			)
		]);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var tinyApis = TinyApis(editor);

		Pipeline.async({}, [
			sBoldTests(tinyApis),
			sH2Tests(tinyApis),
			sLinkTests(tinyApis),
			sInsertTableTests(tinyApis)
		], onSuccess, onFailure);
	}, {
		theme: 'inlight',
		plugins: 'image table link paste contextmenu textpattern',
		insert_toolbar: 'image media table',
		selection_toolbar: 'bold italic | link h1 h2 blockquote',
		inline: true
	}, success, failure);
});
