/**
 * UndoManager.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher;

	/**
	 * This class handles the undo/redo history levels for the editor. Since the build in undo/redo has major drawbacks a custom one was needed.
	 *
	 * @class tinymce.UndoManager
	 */
	tinymce.UndoManager = function(editor) {
		var self, index = 0, data = [], beforeBookmark, onAdd, onUndo, onRedo;

		function getContent() {
			// Remove whitespace before/after and remove pure bogus nodes
			return tinymce.trim(editor.getContent({format : 'raw', no_events : 1}).replace(/<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\/span>/g, ''));
		};

		function addNonTypingUndoLevel() {
			self.typing = false;
			self.add();
		};

		// Create event instances
		onBeforeAdd = new Dispatcher(self);
		onAdd       = new Dispatcher(self);
		onUndo      = new Dispatcher(self);
		onRedo      = new Dispatcher(self);

		// Pass though onAdd event from UndoManager to Editor as onChange
		onAdd.add(function(undoman, level) {
			if (undoman.hasUndo())
				return editor.onChange.dispatch(editor, level, undoman);
		});

		// Pass though onUndo event from UndoManager to Editor
		onUndo.add(function(undoman, level) {
			return editor.onUndo.dispatch(editor, level, undoman);
		});

		// Pass though onRedo event from UndoManager to Editor
		onRedo.add(function(undoman, level) {
			return editor.onRedo.dispatch(editor, level, undoman);
		});

		// Add initial undo level when the editor is initialized
		editor.onInit.add(function() {
			self.add();
		});

		// Get position before an execCommand is processed
		editor.onBeforeExecCommand.add(function(ed, cmd, ui, val, args) {
			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!args || !args.skip_undo)) {
				self.beforeChange();
			}
		});

		// Add undo level after an execCommand call was made
		editor.onExecCommand.add(function(ed, cmd, ui, val, args) {
			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!args || !args.skip_undo)) {
				self.add();
			}
		});

		// Add undo level on save contents, drag end and blur/focusout
		editor.onSaveContent.add(addNonTypingUndoLevel);
		editor.dom.bind(editor.dom.getRoot(), 'dragend', addNonTypingUndoLevel);
		editor.dom.bind(editor.getDoc(), tinymce.isGecko ? 'blur' : 'focusout', function(e) {
			if (!editor.removed && self.typing) {
				addNonTypingUndoLevel();
			}
		});

		editor.onKeyUp.add(function(editor, e) {
			var keyCode = e.keyCode;

			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45 || keyCode == 13 || e.ctrlKey) {
				addNonTypingUndoLevel();
			}
		});

		editor.onKeyDown.add(function(editor, e) {
			var keyCode = e.keyCode;

			// Is caracter positon keys left,right,up,down,home,end,pgdown,pgup,enter
			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45) {
				if (self.typing) {
					addNonTypingUndoLevel();
				}

				return;
			}

			// If key isn't shift,ctrl,alt,capslock,metakey
			if ((keyCode < 16 || keyCode > 20) && keyCode != 224 && keyCode != 91 && !self.typing) {
				self.beforeChange();
				self.typing = true;
				self.add();
			}
		});

		editor.onMouseDown.add(function(editor, e) {
			if (self.typing) {
				addNonTypingUndoLevel();
			}
		});

		// Add keyboard shortcuts for undo/redo keys
		editor.addShortcut('ctrl+z', 'undo_desc', 'Undo');
		editor.addShortcut('ctrl+y', 'redo_desc', 'Redo');

		self = {
			// Explose for debugging reasons
			data : data,

			/**
			 * State if the user is currently typing or not. This will add a typing operation into one undo
			 * level instead of one new level for each keystroke.
			 *
			 * @field {Boolean} typing
			 */
			typing : false,
			
			/**
			 * This event will fire before a new undo level is added to the undo manager
			 * 
			 * @event onBeforeAdd
			 * @param {tinymce.UndoManager} sender UndoManager instance that is going to add the new level
			 * @param {Object} level The new level object containing a bookmark and contents
			 */
			onBeforeAdd: onBeforeAdd,

			/**
			 * This event will fire each time a new undo level is added to the undo manager.
			 *
			 * @event onAdd
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The new level object containing a bookmark and contents.
			 */
			onAdd : onAdd,

			/**
			 * This event will fire when the user make an undo of a change.
			 *
			 * @event onUndo
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The old level object containing a bookmark and contents.
			 */
			onUndo : onUndo,

			/**
			 * This event will fire when the user make an redo of a change.
			 *
			 * @event onRedo
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The old level object containing a bookmark and contents.
			 */
			onRedo : onRedo,

			/**
			 * Stores away a bookmark to be used when performing an undo action so that the selection is before
			 * the change has been made.
			 *
			 * @method beforeChange
			 */
			beforeChange : function() {
				beforeBookmark = editor.selection.getBookmark(2, true);
			},

			/**
			 * Adds a new undo level/snapshot to the undo list.
			 *
			 * @method add
			 * @param {Object} l Optional undo level object to add.
			 * @return {Object} Undo level that got added or null it a level wasn't needed.
			 */
			add : function(level) {
				var i, settings = editor.settings, lastLevel;

				level = level || {};
				level.content = getContent();
				
				self.onBeforeAdd.dispatch(self, level);

				// Add undo level if needed
				lastLevel = data[index];
				if (lastLevel && lastLevel.content == level.content)
					return null;

				// Set before bookmark on previous level
				if (data[index])
					data[index].beforeBookmark = beforeBookmark;

				// Time to compress
				if (settings.custom_undo_redo_levels) {
					if (data.length > settings.custom_undo_redo_levels) {
						for (i = 0; i < data.length - 1; i++)
							data[i] = data[i + 1];

						data.length--;
						index = data.length;
					}
				}

				// Get a non intrusive normalized bookmark
				level.bookmark = editor.selection.getBookmark(2, true);

				// Crop array if needed
				if (index < data.length - 1)
					data.length = index + 1;

				data.push(level);
				index = data.length - 1;

				self.onAdd.dispatch(self, level);
				editor.isNotDirty = 0;

				return level;
			},

			/**
			 * Undoes the last action.
			 *
			 * @method undo
			 * @return {Object} Undo level or null if no undo was performed.
			 */
			undo : function() {
				var level, i;

				if (self.typing) {
					self.add();
					self.typing = false;
				}

				if (index > 0) {
					level = data[--index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.beforeBookmark);

					self.onUndo.dispatch(self, level);
				}

				return level;
			},

			/**
			 * Redoes the last action.
			 *
			 * @method redo
			 * @return {Object} Redo level or null if no redo was performed.
			 */
			redo : function() {
				var level;

				if (index < data.length - 1) {
					level = data[++index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.bookmark);

					self.onRedo.dispatch(self, level);
				}

				return level;
			},

			/**
			 * Removes all undo levels.
			 *
			 * @method clear
			 */
			clear : function() {
				data = [];
				index = 0;
				self.typing = false;
			},

			/**
			 * Returns true/false if the undo manager has any undo levels.
			 *
			 * @method hasUndo
			 * @return {Boolean} true/false if the undo manager has any undo levels.
			 */
			hasUndo : function() {
				return index > 0 || this.typing;
			},

			/**
			 * Returns true/false if the undo manager has any redo levels.
			 *
			 * @method hasRedo
			 * @return {Boolean} true/false if the undo manager has any redo levels.
			 */
			hasRedo : function() {
				return index < data.length - 1 && !this.typing;
			}
		};

		return self;
	};
})(tinymce);
