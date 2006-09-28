/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

/**
 * Constructs a undo redo instance, this instance handles the custom undo/redo handeling in TinyMCE.
 *
 * @param {TinyMCE_Control} inst TinyMCE editor control instance.
 * @constructor
 */
function TinyMCE_UndoRedo(inst) {
	this.instance = inst;
	this.undoLevels = new Array();
	this.undoIndex = 0;
	this.typingUndoIndex = -1;
	this.undoRedo = true;
};

TinyMCE_UndoRedo.prototype = {
	/**
	 * Adds a new undo level, this will take a snapshot of the current instance HTML or use the specified level.
	 *
	 * @param {TinyMCE_UndoRedoLevel} l Optional undo/redo level to add.
	 * @return true/false on success or failure.
	 * @type boolean
	 */
	add : function(l) {
		var b, customUndoLevels, newHTML, inst = this.instance, i, ul, ur;

		if (l) {
			this.undoLevels[this.undoLevels.length] = l;
			return true;
		}

		if (this.typingUndoIndex != -1) {
			this.undoIndex = this.typingUndoIndex;

			if (tinyMCE.typingUndoIndex != -1)
				tinyMCE.undoIndex = tinyMCE.typingUndoIndex;
		}

		newHTML = tinyMCE.trim(inst.getBody().innerHTML);
		if (this.undoLevels[this.undoIndex] && newHTML != this.undoLevels[this.undoIndex].content) {
			//tinyMCE.debug(newHTML, this.undoLevels[this.undoIndex].content);

			tinyMCE.dispatchCallback(inst, 'onchange_callback', 'onChange', inst);

			// Time to compress
			customUndoLevels = tinyMCE.settings['custom_undo_redo_levels'];
			if (customUndoLevels != -1 && this.undoLevels.length > customUndoLevels) {
				for (i=0; i<this.undoLevels.length-1; i++)
					this.undoLevels[i] = this.undoLevels[i+1];

				this.undoLevels.length--;
				this.undoIndex--;

				// Todo: Implement global undo/redo logic here
			}

			b = inst.undoBookmark;

			if (!b)
				b = inst.selection.getBookmark();

			this.undoIndex++;
			this.undoLevels[this.undoIndex] = {
				content : newHTML,
				bookmark : b
			};

			// Remove all above from global undo/redo
			ul = tinyMCE.undoLevels;
			for (i=tinyMCE.undoIndex + 1; i<ul.length; i++) {
				ur = ul[i].undoRedo;

				if (ur.undoIndex == ur.undoLevels.length -1)
					ur.undoIndex--;

				ur.undoLevels.length--;
			}

			// Add global undo level
			tinyMCE.undoLevels[tinyMCE.undoIndex++] = inst;
			tinyMCE.undoLevels.length = tinyMCE.undoIndex;

			this.undoLevels.length = this.undoIndex + 1;

			return true;
		}

		return false;
	},

	/**
	 * Performes a undo action, this will restore the HTML contents of the editor to a former state.
	 */
	undo : function() {
		var inst = this.instance;

		// Do undo
		if (this.undoIndex > 0) {
			this.undoIndex--;

			tinyMCE.setInnerHTML(inst.getBody(), this.undoLevels[this.undoIndex].content);
			inst.repaint();

			if (inst.settings.custom_undo_redo_restore_selection)
				inst.selection.moveToBookmark(this.undoLevels[this.undoIndex].bookmark);
		}
	},

	/**
	 * Performes a undo action, this will restore the HTML contents of the editor to a former undoed state.
	 */
	redo : function() {
		var inst = this.instance;

		tinyMCE.execCommand("mceEndTyping");

		if (this.undoIndex < (this.undoLevels.length-1)) {
			this.undoIndex++;

			tinyMCE.setInnerHTML(inst.getBody(), this.undoLevels[this.undoIndex].content);
			inst.repaint();

			if (inst.settings.custom_undo_redo_restore_selection)
				inst.selection.moveToBookmark(this.undoLevels[this.undoIndex].bookmark);
		}

		tinyMCE.triggerNodeChange();
	}
};
