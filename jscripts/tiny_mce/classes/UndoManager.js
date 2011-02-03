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
		var self, index = 0, data = [];

		function getContent() {
			return tinymce.trim(editor.getContent({format : 'raw', no_events : 1}));
		};

		return self = {
			typing : 0,
			deleting : 0,

			onAdd : new Dispatcher(self),
			onUndo : new Dispatcher(self),
			onRedo : new Dispatcher(self),

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
				if (lastLevel && lastLevel.content == level.content) {
					if (index > 0 || data.length == 1)
						return null;
				}

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
				if (index < data.length - 1) {
					// Treat first level as initial
					if (index == 0)
						data = [];
					else
						data.length = index + 1;
				}

				data.push(level);
				index = data.length - 1;

				self.onAdd.dispatch(self, level);
				editor.isNotDirty = 0;

				return level;
			},

            /**
             * Make a change that is guaranteed transparent to the undo stack.  If the current undo level
             * is equal to the current state, then we advance the current undo level to the new state after
             * the operation.  Otherwise, we do nothing to the undo stack.  The operation is performed in
             * either case.
             * @param cb The operation to perform.
             * @return cb's return code.
             */
            transparentChange : function(cb){
                var currentContent = getContent(), lastLevel = data[index];

                if(lastLevel && lastLevel.content == currentContent){
                    if(index > 0 || data.length == 1){
                        //the current undo point is equal to the current document state.  Run cb and update that undo point to the current state.
                        var ret = cb();
                        lastLevel.content = currentContent;
                        lastLevel.bookmark = editor.selection.getBookmark(2, true);
                        return ret;
                    }
                }
                //fall though; the current undo point is stale, so we can just make changes.
                return cb();
            },

			/**
			 * Undoes the last action.
			 *
			 * @method undo
			 * @return {Object} Undo level or null if no undo was performed.
			 */
			undo : function() {
				var level, i;

				if (self.typing || self.deleting) {
					self.add();
					self.typing = 0;
                    self.deleting = 0;
				}

				if (index > 0) {
					level = data[--index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.bookmark);

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
				index = self.typing = self.deleting = 0;
			},

			/**
			 * Returns true/false if the undo manager has any undo levels.
			 *
			 * @method hasUndo
			 * @return {Boolean} true/false if the undo manager has any undo levels.
			 */
			hasUndo : function() {
				return index > 0 || self.typing || self.deleting;
			},

			/**
			 * Returns true/false if the undo manager has any redo levels.
			 *
			 * @method hasRedo
			 * @return {Boolean} true/false if the undo manager has any redo levels.
			 */
			hasRedo : function() {
				return index < data.length - 1;
			}
		};
	};
})(tinymce);
