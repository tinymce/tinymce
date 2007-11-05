/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	var Dispatcher = tinymce.util.Dispatcher;

	tinymce.create('tinymce.UndoManager', {
		index : 0,
		data : null,
		typing : 0,

		UndoManager : function(ed) {
			var t = this;

			t.editor = ed;
			t.data = [];
			t.onAdd = new Dispatcher(this);
			t.onUndo = new Dispatcher(this);
			t.onRedo = new Dispatcher(this);
		},

		add : function(level) {
			var t = this, i, ed = t.editor, b, s = ed.settings;

			level = level || {};
			level.content = level.content || ed.getContent({format : 'raw', no_events : 1});

			// Add undo level if needed
			level.content = level.content.replace(/^\s*|\s*$/g, '');
			if (!level.initial && level.content == t.data[t.index > 0 ? t.index - 1 : 0].content)
				return false;

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
				level.bookmark = b = level.bookmark || ed.selection.getBookmark();

			if (t.index < t.data.length && t.data[t.index].initial)
				t.index++;

			// Add level
			t.data.length = t.index + 1;
			t.data[t.index++] = level;

			if (level.initial)
				t.index = 0;

			// Set initial bookmark use first real undo level
			if (t.data.length == 2 && t.data[0].initial)
				t.data[0].bookmark = b;

			t.onAdd.dispatch(t, level);

			//console.dir(t.data);

			return true;
		},

		undo : function() {
			var t = this, ed = t.editor, level, i;

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

				level = t.data[--t.index];
				ed.setContent(level.content, {format : 'raw'});
				ed.selection.moveToBookmark(level.bookmark);

				t.onUndo.dispatch(t, level);
			}
		},

		redo : function() {
			var t = this, ed = t.editor, level;

			if (t.index < t.data.length - 1) {
				level = t.data[++t.index];
				ed.setContent(level.content, {format : 'raw'});
				ed.selection.moveToBookmark(level.bookmark);

				t.onRedo.dispatch(t, level);
			}
		},

		clear : function() {
			var t = this;

			t.data = [];
			t.index = 0;
			t.typing = 0;
			t.add({initial : true});
		},

		hasUndo : function() {
			return this.index != 0 || this.typing;
		},

		hasRedo : function() {
			return this.index < this.data.length - 1;
		}
	});
})();