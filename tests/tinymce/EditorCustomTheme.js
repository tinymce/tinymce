ModuleLoader.require([
], function() {
	module("tinymce.EditorCustomTheme", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				toolbar: 'bold italic underline',
				theme: function (editor, targetnode) {
					var editorContainer = document.createElement('div');
					editorContainer.id = 'editorContainer';

					var iframeContainer = document.createElement('div');
					iframeContainer.id = 'iframeContainer';

					editorContainer.appendChild(iframeContainer);
					targetnode.appendChild(editorContainer);

					return {
						iframeContainer: iframeContainer,
						editorContainer: editorContainer
					};
				},
				init_instance_callback: function(ed) {
					window.editor = ed;
					QUnit.start();
				}
			});
		}
	});

	test('getContainer/getContentAreaContainer', function() {
		QUnit.equal(editor.getContainer().id, 'editorContainer', 'Should be the new editorContainer element');
		QUnit.equal(editor.getContainer().nodeType, 1, 'Should be an element');
		QUnit.equal(editor.getContentAreaContainer().id, 'iframeContainer', 'Should be the new iframeContainer element');
		QUnit.equal(editor.getContentAreaContainer().nodeType, 1, 'Should be an element');
	});
});
