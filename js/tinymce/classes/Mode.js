/**
 * Mode.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Mode switcher logic.
 *
 * @private
 * @class tinymce.Mode
 */
define("tinymce/Mode", [], function() {
	function setEditorCommandState(editor, cmd, state) {
		try {
			editor.getDoc().execCommand(cmd, false, state);
		} catch (ex) {
			// Ignore
		}
	}

	function setMode(editor, mode) {
		var currentMode = editor.readonly ? 'readonly' : 'design';

		if (mode == currentMode) {
			return;
		}

		if (mode == 'readonly') {
			editor.selection.controlSelection.hideResizeRect();
			editor.readonly = true;
			editor.getBody().contentEditable = false;
		} else {
			editor.readonly = false;
			editor.getBody().contentEditable = true;
			setEditorCommandState(editor, "StyleWithCSS", false);
			setEditorCommandState(editor, "enableInlineTableEditing", false);
			setEditorCommandState(editor, "enableObjectResizing", false);
			editor.focus();
			editor.nodeChanged();
		}

		// Event is NOT preventable
		editor.fire('SwitchMode', {mode: mode});
	}

	return {
		setMode: setMode
	};
});