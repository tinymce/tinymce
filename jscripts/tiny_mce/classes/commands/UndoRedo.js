/**
 * $Id: EditorCommands.js 1042 2009-03-04 16:00:50Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
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
