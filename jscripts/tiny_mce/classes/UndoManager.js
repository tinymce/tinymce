/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2008, Moxiecode Systems AB, All rights reserved.
 */

(function(tinymce) {
	/**#@+
	 * @class This class handles the undo/redo history levels for the editor. Since the build in undo/redo has major drawbacks a custom one was needed.
	 * @member tinymce.UndoManager
	 */
	tinymce.create('tinymce.UndoManager', {
		index : 0,
		data : null,
		typing : 0,

		/**
		 * Constructs a new UndoManager instance.
		 *
		 * @constructor
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

		/**#@+
		 * @method
		 */

		/**
		 * Adds a new undo level/snapshot to the undo list.
		 *
		 * @param {Object} l Optional undo level object to add.
		 * @return {Object} Undo level that got added or null it a level wasn't needed.
		 */
		add : function(l) {
			var t = this, i, ed = t.editor, b, s = ed.settings, la;

			l = l || {};
			l.content = l.content || ed.getContent({format : 'raw', no_events : 1});

			// Add undo level if needed
			l.content = l.content.replace(/^\s*|\s*$/g, '');
			la = t.data[t.index > 0 && (t.index == 0 || t.index == t.data.length) ? t.index - 1 : t.index];
			if (!l.initial && la && l.content == la.content)
				return null;

			// Time to compress
			if (s.custom_undo_redo_levels) {
				if (t.data.length > s.custom_undo_redo_levels) {
					for (i = 0; i < t.data.length - 1; i++)
						t.data[i] = t.data[i + 1];

					t.data.length--;
					t.index = t.data.length;
				}
			}

			if (s.custom_undo_redo_restore_selection && !l.initial)
				l.bookmark = b = l.bookmark || ed.selection.getBookmark();

			if (t.index < t.data.length)
				t.index++;

			// Only initial marked undo levels should be allowed as first item
			// This to workaround a bug with Firefox and the blur event
			if (t.data.length === 0 && !l.initial)
				return null;

			// Add level
			t.data.length = t.index + 1;
			t.data[t.index++] = l;

			if (l.initial)
				t.index = 0;

			// Set initial bookmark use first real undo level
			if (t.data.length == 2 && t.data[0].initial)
				t.data[0].bookmark = b;

			t.onAdd.dispatch(t, l);
			ed.isNotDirty = 0;

			//console.dir(t.data);

			return l;
		},

		/**
		 * Undoes the last action.
		 *
		 * @return {Object} Undo level or null if no undo was performed.
		 */
		undo : function() {
			var t = this, ed = t.editor, l = l, i;

			if (t.typing) {
				t.add();
				t.typing = 0;
			}

			if (t.index > 0) {
				// If undo on last index then take snapshot
				if (t.index == t.data.length && t.index > 1) {
					i = t.index;
					t.typing = 0;

					if (!t.add())
						t.index = i;

					--t.index;
				}

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
		 */
		clear : function() {
			var t = this;

			t.data = [];
			t.index = 0;
			t.typing = 0;
			t.add({initial : true});
		},

		/**
		 * Returns true/false if the undo manager has any undo levels.
		 *
		 * @return {bool} true/false if the undo manager has any undo levels.
		 */
		hasUndo : function() {
			return this.index != 0 || this.typing;
		},

		/**
		 * Returns true/false if the undo manager has any redo levels.
		 *
		 * @return {bool} true/false if the undo manager has any redo levels.
		 */
		hasRedo : function() {
			return this.index < this.data.length - 1;
		}

		/**#@-*/
	});
})(tinymce);
