/**
 * plugin.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */

tinymce.PluginManager.add('save', function(editor) {
	function save() {
		var formObj;

		formObj = tinymce.DOM.getParent(editor.id, 'form');

		if (editor.getParam("save_enablewhendirty", true) && !editor.isDirty()) {
			return;
		}

		tinymce.triggerSave();

		// Use callback instead
		if (editor.getParam("save_onsavecallback")) {
			if (editor.execCallback('save_onsavecallback', editor)) {
				editor.startContent = tinymce.trim(editor.getContent({format: 'raw'}));
				editor.nodeChanged();
			}

			return;
		}

		if (formObj) {
			editor.isNotDirty = true;

			if (!formObj.onsubmit || formObj.onsubmit()) {
				if (typeof formObj.submit == "function") {
					formObj.submit();
				} else {
					editor.windowManager.alert("Error: Form submit field collision.");
				}
			}

			editor.nodeChanged();
		} else {
			editor.windowManager.alert("Error: No form element found.");
		}
	}

	function cancel() {
		var h = tinymce.trim(editor.startContent);

		// Use callback instead
		if (editor.getParam("save_oncancelcallback")) {
			editor.execCallback('save_oncancelcallback', editor);
			return;
		}

		editor.setContent(h);
		editor.undoManager.clear();
		editor.nodeChanged();
	}

	function stateToggle() {
		var self = this;

		editor.on('nodeChange', function() {
			self.disabled(editor.getParam("save_enablewhendirty", true) && !editor.isDirty());
		});
	}

	editor.addCommand('mceSave', save);
	editor.addCommand('mceCancel', cancel);

	editor.addButton('save', {
		icon: 'save',
		text: 'Save',
		cmd: 'mceSave',
		disabled: true,
		onPostRender: stateToggle
	});

	editor.addButton('cancel', {
		text: 'Cancel',
		icon: false,
		cmd: 'mceCancel',
		disabled: true,
		onPostRender: stateToggle
	});

	editor.addShortcut('Meta+S', '', 'mceSave');
});
