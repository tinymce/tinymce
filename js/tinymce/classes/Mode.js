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

	function clickBlocker(editor) {
		var target, handler;

		target = editor.getBody();

		handler = function(e) {
			if (editor.dom.getParents(e.target, 'a').length > 0) {
				e.preventDefault();
			}
		};

		editor.dom.bind(target, 'click', handler);

		return {
			unbind: function() {
				editor.dom.unbind(target, 'click', handler);
			}
		};
	}

	function toggleReadOnly(editor, state) {
		if (editor._clickBlocker) {
			editor._clickBlocker.unbind();
			editor._clickBlocker = null;
		}

		if (state) {
			editor._clickBlocker = clickBlocker(editor);
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
	}

	function setMode(editor, mode) {
		var currentMode = editor.readonly ? 'readonly' : 'design';

		if (mode == currentMode) {
			return;
		}

		if (editor.initialized) {
			toggleReadOnly(editor, mode == 'readonly');
		} else {
			editor.on('init', function() {
				toggleReadOnly(editor, mode == 'readonly');
			});
		}

		// Event is NOT preventable
		editor.fire('SwitchMode', {mode: mode});
	}

	return {
		setMode: setMode
	};
});