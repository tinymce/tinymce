ModuleLoader.require([
	"tinymce/FocusManager",
	"tinymce/dom/DOMUtils"
], function (FocusManager, DOMUtils) {
	var DOM = DOMUtils.DOM;

	module("tinymce.FocusManager", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	test('isEditorUIElement on valid element', function () {
		var uiElm = DOM.create('div', {'class': 'mce-abc'}, null);
		equal(FocusManager.isEditorUIElement(uiElm), true, 'Should be true since mce- is a ui prefix');
	});

	test('isEditorUIElement on invalid element', function () {
		var noUiElm = DOM.create('div', {'class': 'mcex-abc'}, null);
		equal(FocusManager.isEditorUIElement(noUiElm), false, 'Should be true since mcex- is not a ui prefix');
	});

	test('_isUIElement on valid element', function () {
		var uiElm1 = DOM.create('div', {'class': 'mce-abc'}, null);
		var uiElm2 = DOM.create('div', {'class': 'mcex-abc'}, null);
		var noUiElm = DOM.create('div', {'class': 'mcey-abc'}, null);
		editor.settings.custom_ui_selector = '.mcex-abc';
		equal(FocusManager._isUIElement(editor, uiElm1), true, 'Should be true since mce- is a ui prefix');
		equal(FocusManager._isUIElement(editor, uiElm2), true, 'Should be true since mcex- is a ui prefix');
		equal(FocusManager._isUIElement(editor, noUiElm), false, 'Should be true since mcey- is not a ui prefix');
		delete editor.settings.custom_ui_selector;
	});
});
