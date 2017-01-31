asynctest('tinymce.lists.browser.BackspaceDeleteInlineTest', [
	'global!document',
	'ephox/tinymce',
	'tinymce.lists.Plugin',
	'tinymce.lists.test.LegacyUnit',
	'ephox.mcagar.api.TinyLoader',
	'ephox.agar.api.Pipeline'
], function (
	document, tinymce, Plugin, LegacyUnit, TinyLoader, Pipeline
) {
	var success = arguments[arguments.length - 2];
	var failure = arguments[arguments.length - 1];
	var suite = LegacyUnit.createSuite();

	suite.test('Backspace at beginning of LI on body UL', function (editor) {
		editor.focus();
		editor.selection.setCursorLocation(editor.getBody().firstChild.firstChild, 0);
		editor.plugins.lists.backspaceDelete();
		LegacyUnit.equal(tinymce.$('#lists ul').length, 3);
		LegacyUnit.equal(tinymce.$('#lists li').length, 3);
	});

	suite.test('Delete at end of LI on body UL', function (editor) {
		editor.focus();
		editor.selection.setCursorLocation(editor.getBody().firstChild.firstChild, 1);
		editor.plugins.lists.backspaceDelete(true);
		LegacyUnit.equal(tinymce.$('#lists ul').length, 3);
		LegacyUnit.equal(tinymce.$('#lists li').length, 3);
	});

	var teardown = function (editor, div) {
		editor.remove();
		div.parentNode.removeChild(div);
	};

	var setup = function (success, failure) {
		var div = document.createElement('div');

		div.innerHTML = (
			'<div id="lists">' +
				'<ul><li>before</li></ul>' +
				'<ul id="inline"><li>x</li></ul>' +
				'<ul><li>after</li></ul>' +
			'</div>'
		);

		document.body.appendChild(div);

		tinymce.init({
			selector: '#inline',
			inline: true,
			add_unload_trigger: false,
			skin: false,
			plugins: "lists",
			disable_nodechange: true,
			init_instance_callback: function (editor) {
				Pipeline.async({}, suite.toSteps(editor), function () {
					teardown(editor, div);
					success();
				}, failure);
			},
			valid_styles: {
				'*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
					'margin,margin-top,margin-right,margin-bottom,margin-left,display,position,top,left,list-style-type'
			}
		});
	};

	setup(success, failure);
});