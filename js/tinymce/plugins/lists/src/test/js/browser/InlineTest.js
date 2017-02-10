asynctest('tinymce.lists.browser.IndentTest', [
	'tinymce.lists.Plugin',
	'tinymce.lists.test.LegacyUnit',
	'ephox.mcagar.api.TinyLoader',
	'ephox.agar.api.Pipeline'
], function (
	Plugin, LegacyUnit, TinyLoader, Pipeline
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	suite.test('Remove UL in inline body element contained in LI', function (editor) {
		editor.setContent('<ul><li>a</li></ul>');
		editor.selection.setCursorLocation();
		editor.execCommand('InsertUnorderedList');
		LegacyUnit.equal(editor.getContent(), '<p>a</p>');
	});

	suite.test('Backspace in LI in UL in inline body element contained within LI', function (editor) {
		editor.setContent('<ul><li>a</li></ul>');
		editor.focus();
		editor.selection.select(editor.getBody(), true);
		editor.selection.collapse(true);
		editor.plugins.lists.backspaceDelete();
		LegacyUnit.equal(editor.getContent(), '<p>a</p>');
	});

	TinyLoader.setup(function (editor, onSuccess, onFailure) {
		Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
	}, {
		inline: true,
		plugins: "lists",
		add_unload_trigger: false,
		disable_nodechange: true,
		indent: false,
		entities: 'raw',
		valid_elements:
			'li[style|class|data-custom],ol[style|class|data-custom],' +
			'ul[style|class|data-custom],dl,dt,dd,em,strong,span,#p,div,br',
		valid_styles: {
			'*': 'color,font-size,font-family,background-color,font-weight,' +
				'font-style,text-decoration,float,margin,margin-top,margin-right,' +
				'margin-bottom,margin-left,display,position,top,left,list-style-type'
		}
	}, success, failure);
});