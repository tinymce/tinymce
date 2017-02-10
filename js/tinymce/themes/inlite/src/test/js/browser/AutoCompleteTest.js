asynctest('browser/AutoCompleteTest', [
	'ephox.mcagar.api.TinyLoader',
	'ephox.mcagar.api.TinyApis',
	'ephox.mcagar.api.TinyActions',
	'ephox.mcagar.api.TinyDom',
	'tinymce.inlite.test.Toolbar',
	'tinymce/inlite/Theme',
	'ephox.agar.api.Pipeline',
	'ephox.agar.api.Chain',
	'ephox.agar.api.UiFinder',
	'ephox.agar.api.Mouse',
	'ephox.agar.api.Keyboard',
	'ephox.agar.api.Keys',
	'ephox.agar.api.GeneralSteps',
	'ephox.agar.api.UiControls',
	'ephox.agar.api.FocusTools'
], function (
	TinyLoader, TinyApis, TinyActions, TinyDom, Toolbar, Theme,
	Pipeline, Chain, UiFinder, Mouse, Keyboard, Keys, GeneralSteps, UiControls, FocusTools
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];

	var cKeyStroke = function (keyvalue, modifiers) {
		return Chain.op(function (dispatcher) {
			Keyboard.keystroke(keyvalue, modifiers, dispatcher);
		});
	};

	var sSetupLinkableContent = function (tinyApis) {
		return GeneralSteps.sequence([
			tinyApis.sSetContent(
				'<h1 id="a">abc</h1>' +
				'<h2 id="b">abcd</h2>' +
				'<h3 id="c">abce</h3>'
			),
			tinyApis.sSetSelection([0, 0], 0, [0, 0], 1)
		]);
	};

	var sSelectAutoCompleteLink = function (tinyApis, url) {
		return Chain.asStep({}, [
			Chain.fromParent(Toolbar.cWaitForToolbar, [
				Toolbar.cClickButton('Insert/Edit link')
			]),
			Chain.fromParent(UiFinder.cFindIn('input'), [
				UiControls.cSetValue(url),
				cKeyStroke(Keys.space(), {}),
				cKeyStroke(Keys.down(), {})
			]),
			Chain.inject(TinyDom.fromDom(document)),
			Chain.fromParent(FocusTools.cGetFocused, [
				cKeyStroke(Keys.down(), {}),
				cKeyStroke(Keys.enter(), {})
			]),
			Chain.fromParent(Toolbar.cWaitForToolbar, [
				Toolbar.cClickButton('Ok')
			])
		]);
	};

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		var tinyApis = TinyApis(editor);

		Pipeline.async({}, [
			sSetupLinkableContent(tinyApis),
			sSelectAutoCompleteLink(tinyApis, 'a'),
			tinyApis.sAssertContent(
				'<h1 id="a"><a href="#b">a</a>bc</h1>\n' +
				'<h2 id="b">abcd</h2>\n' +
				'<h3 id="c">abce</h3>'
			)
		], onSuccess, onFailure);
	}, {
		theme: 'inlite',
		plugins: 'image table link paste contextmenu textpattern',
		insert_toolbar: 'quickimage media quicktable',
		selection_toolbar: 'bold italic | quicklink h1 h2 blockquote',
		inline: true
	}, success, failure);
});
