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
	/**
	 * This class handles the undo/redo history levels for the editor. Since the build in undo/redo has major drawbacks a custom one was needed.
	 * @class tinymce.UndoManager
	 */
	tinymce.create('tinymce.UndoManager', {
		index : 0,
		data : null,
		typing : 0,

		/**
		 * Constructs a new UndoManager instance.
		 *
		 * @constructor
		 * @method UndoManager
		 * @param {tinymce.Editor} ed Editor instance to undo/redo in.
		 */
		UndoManager : function(ed) {
			var t = this, Dispatcher = tinymce.util.Dispatcher;

			t.editor = ed;
			t.data = [];
			t.onAdd = new Dispatcher(this);
			t.onUndo = new Dispatcher(this);
			t.onRedo = new Dispatcher(this);
		},

		/**
		 * Adds a new undo level/snapshot to the undo list.
		 *
		 * @method add
		 * @param {Object} l Optional undo level object to add.
		 * @return {Object} Undo level that got added or null it a level wasn't needed.
		 */
		add : function(l) {
			var t = this, i, ed = t.editor, b, s = ed.settings, la;

			l = l || {};
			l.content = l.content || ed.getContent({format : 'raw', no_events : 1});
			l.content = l.content.replace(/^\s*|\s*$/g, '');

			// Add undo level if needed
			la = t.data[t.index];
			if (la && la.content == l.content) {
				if (t.index > 0 || t.data.length == 1)
					return null;
			}

			// Time to compress
			if (s.custom_undo_redo_levels) {
				if (t.data.length > s.custom_undo_redo_levels) {
					for (i = 0; i < t.data.length - 1; i++)
						t.data[i] = t.data[i + 1];

					t.data.length--;
					t.index = t.data.length;
				}
			}

			if (s.custom_undo_redo_restore_selection)
				l.bookmark = b = l.bookmark || ed.selection.getBookmark(2, true);

			// Crop array if needed
			if (t.index < t.data.length - 1) {
				// Treat first level as initial
				if (t.index == 0)
					t.data = [];
				else
					t.data.length = t.index + 1;
			}

			t.data.push(l);
			t.index = t.data.length - 1;

			t.onAdd.dispatch(t, l);
			ed.isNotDirty = 0;

			//console.log(t.index);
			//console.dir(t.data);

			return l;
		},

		/**
		 * Undoes the last action.
		 *
		 * @method undo
		 * @return {Object} Undo level or null if no undo was performed.
		 */
		undo : function() {
			var t = this, ed = t.editor, l = l, i;

			if (t.typing) {
				t.add();
				t.typing = 0;
			}

			if (t.index > 0) {
				l = t.data[--t.index];

				ed.setContent(l.content, {format : 'raw'});
				ed.selection.moveToBookmark(l.bookmark);

				t.onUndo.dispatch(t, l);
			}

			return l;
		},

		/**
		 * Redoes the last action.
		 *
		 * @method redo
		 * @return {Object} Redo level or null if no redo was performed.
		 */
		redo : function() {
			var t = this, ed = t.editor, l = null;

			if (t.index < t.data.length - 1) {
				l = t.data[++t.index];
				ed.setContent(l.content, {format : 'raw'});
				ed.selection.moveToBookmark(l.bookmark);

				t.onRedo.dispatch(t, l);
			}

			return l;
		},

		/**
		 * Removes all undo levels.
		 *
		 * @method clear
		 */
		clear : function() {
			var t = this;

			t.data = [];
			t.index = 0;
			t.typing = 0;
		},

		/**
		 * Returns true/false if the undo manager has any undo levels.
		 *
		 * @method hasUndo
		 * @return {Boolean} true/false if the undo manager has any undo levels.
		 */
		hasUndo : function() {
			return this.index > 0 || this.typing;
		},

		/**
		 * Returns true/false if the undo manager has any redo levels.
		 *
		 * @method hasRedo
		 * @return {Boolean} true/false if the undo manager has any redo levels.
		 */
		hasRedo : function() {
			return this.index < this.data.length - 1;
		}
	});
})(tinymce);
