/**
 * UndoManager.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles the undo/redo history levels for the editor. Since the built-in undo/redo has major drawbacks a custom one was needed.
 *
 * @class tinymce.UndoManager
 */
define("tinymce/UndoManager", [
	"tinymce/util/VK",
	"tinymce/Env"
], function(VK, Env) {
	return function(editor) {
		var self = this, index = 0, data = [], beforeBookmark, isFirstTypedCharacter, locks = 0;

		function getContent() {
			return editor.serializer.getTrimmedContent();
		}

		function setDirty(state) {
			editor.setDirty(state);
		}

		function addNonTypingUndoLevel(e) {
			self.typing = false;
			self.add({}, e);
		}

		// Add initial undo level when the editor is initialized
		editor.on('init', function() {
			self.add();
		});

		// Get position before an execCommand is processed
		editor.on('BeforeExecCommand', function(e) {
			var cmd = e.command;

			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint') {
				self.beforeChange();
			}
		});

		// Add undo level after an execCommand call was made
		editor.on('ExecCommand', function(e) {
			var cmd = e.command;

			if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint') {
				addNonTypingUndoLevel(e);
			}
		});

		editor.on('ObjectResizeStart Cut', function() {
			self.beforeChange();
		});

		editor.on('SaveContent ObjectResized blur', addNonTypingUndoLevel);
		editor.on('DragEnd', addNonTypingUndoLevel);

		editor.on('KeyUp', function(e) {
			var keyCode = e.keyCode;

			// If key is prevented then don't add undo level
			// This would happen on keyboard shortcuts for example
			if (e.isDefaultPrevented()) {
				return;
			}

			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45 || keyCode == 13 || e.ctrlKey) {
				addNonTypingUndoLevel();
				editor.nodeChanged();
			}

			if (keyCode == 46 || keyCode == 8 || (Env.mac && (keyCode == 91 || keyCode == 93))) {
				editor.nodeChanged();
			}

			// Fire a TypingUndo event on the first character entered
			if (isFirstTypedCharacter && self.typing) {
				// Make it dirty if the content was changed after typing the first character
				if (!editor.isDirty()) {
					setDirty(data[0] && getContent() != data[0].content);

					// Fire initial change event
					if (editor.isDirty()) {
						editor.fire('change', {level: data[0], lastLevel: null});
					}
				}

				editor.fire('TypingUndo');
				isFirstTypedCharacter = false;
				editor.nodeChanged();
			}
		});

		editor.on('KeyDown', function(e) {
			var keyCode = e.keyCode;

			// If key is prevented then don't add undo level
			// This would happen on keyboard shortcuts for example
			if (e.isDefaultPrevented()) {
				return;
			}

			// Is character position keys left,right,up,down,home,end,pgdown,pgup,enter
			if ((keyCode >= 33 && keyCode <= 36) || (keyCode >= 37 && keyCode <= 40) || keyCode == 45) {
				if (self.typing) {
					addNonTypingUndoLevel(e);
				}

				return;
			}

			// If key isn't Ctrl+Alt/AltGr
			var modKey = (e.ctrlKey && !e.altKey) || e.metaKey;
			if ((keyCode < 16 || keyCode > 20) && keyCode != 224 && keyCode != 91 && !self.typing && !modKey) {
				self.beforeChange();
				self.typing = true;
				self.add({}, e);
				isFirstTypedCharacter = true;
			}
		});

		editor.on('MouseDown', function(e) {
			if (self.typing) {
				addNonTypingUndoLevel(e);
			}
		});

		// Add keyboard shortcuts for undo/redo keys
		editor.addShortcut('meta+z', '', 'Undo');
		editor.addShortcut('meta+y,meta+shift+z', '', 'Redo');

		editor.on('AddUndo Undo Redo ClearUndos', function(e) {
			if (!e.isDefaultPrevented()) {
				editor.nodeChanged();
			}
		});

		/*eslint consistent-this:0 */
		self = {
			// Explode for debugging reasons
			data: data,

			/**
			 * State if the user is currently typing or not. This will add a typing operation into one undo
			 * level instead of one new level for each keystroke.
			 *
			 * @field {Boolean} typing
			 */
			typing: false,

			/**
			 * Stores away a bookmark to be used when performing an undo action so that the selection is before
			 * the change has been made.
			 *
			 * @method beforeChange
			 */
			beforeChange: function() {
				if (!locks) {
					beforeBookmark = editor.selection.getBookmark(2, true);
				}
			},

			/**
			 * Adds a new undo level/snapshot to the undo list.
			 *
			 * @method add
			 * @param {Object} level Optional undo level object to add.
			 * @param {DOMEvent} event Optional event responsible for the creation of the undo level.
			 * @return {Object} Undo level that got added or null it a level wasn't needed.
			 */
			add: function(level, event) {
				var i, settings = editor.settings, lastLevel;

				level = level || {};
				level.content = getContent();

				if (locks || editor.removed) {
					return null;
				}

				lastLevel = data[index];
				if (editor.fire('BeforeAddUndo', {level: level, lastLevel: lastLevel, originalEvent: event}).isDefaultPrevented()) {
					return null;
				}

				// Add undo level if needed
				if (lastLevel && lastLevel.content == level.content) {
					return null;
				}

				// Set before bookmark on previous level
				if (data[index]) {
					data[index].beforeBookmark = beforeBookmark;
				}

				// Time to compress
				if (settings.custom_undo_redo_levels) {
					if (data.length > settings.custom_undo_redo_levels) {
						for (i = 0; i < data.length - 1; i++) {
							data[i] = data[i + 1];
						}

						data.length--;
						index = data.length;
					}
				}

				// Get a non intrusive normalized bookmark
				level.bookmark = editor.selection.getBookmark(2, true);

				// Crop array if needed
				if (index < data.length - 1) {
					data.length = index + 1;
				}

				data.push(level);
				index = data.length - 1;

				var args = {level: level, lastLevel: lastLevel, originalEvent: event};

				editor.fire('AddUndo', args);

				if (index > 0) {
					setDirty(true);
					editor.fire('change', args);
				}

				return level;
			},

			/**
			 * Undoes the last action.
			 *
			 * @method undo
			 * @return {Object} Undo level or null if no undo was performed.
			 */
			undo: function() {
				var level;

				if (self.typing) {
					self.add();
					self.typing = false;
				}

				if (index > 0) {
					level = data[--index];

					editor.setContent(level.content, {format: 'raw'});
					editor.selection.moveToBookmark(level.beforeBookmark);
					setDirty(true);

					editor.fire('undo', {level: level});
				}

				return level;
			},

			/**
			 * Redoes the last action.
			 *
			 * @method redo
			 * @return {Object} Redo level or null if no redo was performed.
			 */
			redo: function() {
				var level;

				if (index < data.length - 1) {
					level = data[++index];

					editor.setContent(level.content, {format: 'raw'});
					editor.selection.moveToBookmark(level.bookmark);
					setDirty(true);

					editor.fire('redo', {level: level});
				}

				return level;
			},

			/**
			 * Removes all undo levels.
			 *
			 * @method clear
			 */
			clear: function() {
				data = [];
				index = 0;
				self.typing = false;
				editor.fire('ClearUndos');
			},

			/**
			 * Returns true/false if the undo manager has any undo levels.
			 *
			 * @method hasUndo
			 * @return {Boolean} true/false if the undo manager has any undo levels.
			 */
			hasUndo: function() {
				// Has undo levels or typing and content isn't the same as the initial level
				return index > 0 || (self.typing && data[0] && getContent() != data[0].content);
			},

			/**
			 * Returns true/false if the undo manager has any redo levels.
			 *
			 * @method hasRedo
			 * @return {Boolean} true/false if the undo manager has any redo levels.
			 */
			hasRedo: function() {
				return index < data.length - 1 && !this.typing;
			},

			/**
			 * Executes the specified function in an undo translation. The selection
			 * before the modification will be stored to the undo stack and if the DOM changes
			 * it will add a new undo level. Any methods within the translation that adds undo levels will
			 * be ignored. So a translation can include calls to execCommand or editor.insertContent.
			 *
			 * @method transact
			 * @param {function} callback Function to execute dom manipulation logic in.
			 */
			transact: function(callback) {
				self.beforeChange();

				try {
					locks++;
					callback();
				} finally {
					locks--;
				}

				self.add();
			}
		};

		return self;
	};
});
