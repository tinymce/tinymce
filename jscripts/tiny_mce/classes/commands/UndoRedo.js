/**
 * UndoRedo.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	var cmds = tinymce.GlobalCommands;

	cmds.add(['mceEndUndoLevel', 'mceAddUndoLevel'], function() {
		this.undoManager.add();
	});

	cmds.add('Undo', function() {
		var ed = this;

		if (ed.settings.custom_undo_redo) {
			ed.undoManager.undo();
			ed.nodeChanged();
			return true;
		}

		return false; // Run browser command
	});

	cmds.add('Redo', function() {
		var ed = this;

		if (ed.settings.custom_undo_redo) {
			ed.undoManager.redo();
			ed.nodeChanged();
			return true;
		}

		return false; // Run browser command
	});
})();
