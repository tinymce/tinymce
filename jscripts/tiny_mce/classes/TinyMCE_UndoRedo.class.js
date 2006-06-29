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
		var b;

		if (l) {
			this.undoLevels[this.undoLevels.length] = l;
			return true;
		}

		var inst = this.instance;

		if (this.typingUndoIndex != -1) {
			this.undoIndex = this.typingUndoIndex;
			// tinyMCE.debug("Override: " + this.undoIndex);
		}

		var newHTML = tinyMCE.trim(inst.getBody().innerHTML);
		if (this.undoLevels[this.undoIndex] && newHTML != this.undoLevels[this.undoIndex].content) {
			//tinyMCE.debug(newHTML, this.undoLevels[this.undoIndex]);

			tinyMCE.dispatchCallback(inst, 'onchange_callback', 'onChange', inst);

			// Time to compress
			var customUndoLevels = tinyMCE.settings['custom_undo_redo_levels'];
			if (customUndoLevels != -1 && this.undoLevels.length > customUndoLevels) {
				for (var i=0; i<this.undoLevels.length-1; i++) {
					//tinyMCE.debug(this.undoLevels[i] + "=" + this.undoLevels[i+1]);
					this.undoLevels[i] = this.undoLevels[i+1];
				}

				this.undoLevels.length--;
				this.undoIndex--;
			}

			b = inst.undoBookmark;
			if (!b)
				b = inst.selection.getBookmark();

			this.undoIndex++;
			this.undoLevels[this.undoIndex] = {
				content : newHTML,
				bookmark : b
			};

			this.undoLevels.length = this.undoIndex + 1;

			//tinyMCE.debug("level added" + this.undoIndex);
			return true;

			// tinyMCE.debug(this.undoIndex + "," + (this.undoLevels.length-1));
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

		// tinyMCE.debug("Undo - undo levels:" + this.undoLevels.length + ", undo index: " + this.undoIndex);
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
//					if (this.undoIndex > 0)
//						inst.selection.moveToBookmark(this.undoLevels[this.undoIndex-1].bookmark);
			if (inst.settings.custom_undo_redo_restore_selection)
				inst.selection.moveToBookmark(this.undoLevels[this.undoIndex].bookmark);
			// tinyMCE.debug("Redo - undo levels:" + this.undoLevels.length + ", undo index: " + this.undoIndex);
		}

		tinyMCE.triggerNodeChange();
	}
};
