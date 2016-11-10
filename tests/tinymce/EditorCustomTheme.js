ModuleLoader.require([
], function() {
	module("tinymce.EditorCustomTheme", {
		setupModule: function() {
			QUnit.stop();

			tinymce.init({
				selector: "textarea",
				add_unload_trigger: false,
				disable_nodechange: true,
				skin: false,
				entities: 'raw',
				indent: false,
				theme: function (editor, targetnode) {
					var editorContainer = document.createElement('div');
					editorContainer.id = 'editorContainer';

					var iframeContainer = document.createElement('div');
					iframeContainer.id = 'iframeContainer';

					editorContainer.appendChild(iframeContainer);
					targetnode.parentNode.insertBefore(editorContainer, targetnode);

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
