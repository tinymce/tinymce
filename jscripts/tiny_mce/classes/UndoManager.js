/**
 * UndoManager.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher;

	/**
	 * This class handles the undo/redo history levels for the editor. Since the build in undo/redo has major drawbacks a custom one was needed.
	 *
	 * @class tinymce.UndoManager
	 */
	tinymce.UndoManager = function(editor) {
		var self, index = 0, data = [], beforeBookmark;

		function getContent() {
			return tinymce.trim(editor.getContent({format : 'raw', no_events : 1}));
		};

		return self = {
			/**
			 * State if the user is currently typing or not. This will add a typing operation into one undo
			 * level instead of one new level for each keystroke.
			 *
			 * @field {Boolean} typing
			 */
			typing : false,

			/**
			 * This event will fire each time a new undo level is added to the undo manager.
			 *
			 * @event onAdd
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The new level object containing a bookmark and contents.
			 */
			onAdd : new Dispatcher(self),

			/**
			 * This event will fire when the user make an undo of a change.
			 *
			 * @event onUndo
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The old level object containing a bookmark and contents.
			 */
			onUndo : new Dispatcher(self),

			/**
			 * This event will fire when the user make an redo of a change.
			 *
			 * @event onRedo
			 * @param {tinymce.UndoManager} sender UndoManager instance that got the new level.
			 * @param {Object} level The old level object containing a bookmark and contents.
			 */
			onRedo : new Dispatcher(self),

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
	};
})(tinymce);
