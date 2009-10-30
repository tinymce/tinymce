/**
 * EditorCommands.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var each = tinymce.each, isIE = tinymce.isIE, isGecko = tinymce.isGecko, isOpera = tinymce.isOpera, isWebKit = tinymce.isWebKit;

	/**
	 * This is a internal class and no method in this class should be called directly form the out side.
	 */
	tinymce.create('tinymce.EditorCommands', {
		EditorCommands : function(ed) {
			this.editor = ed;
		},

		execCommand : function(cmd, ui, val) {
			var t = this, ed = t.editor, f;

			switch (cmd) {
				// Ignore these
				case 'mceResetDesignMode':
				case 'mceBeginUndoLevel':
					return true;

				// Ignore these
				case 'unlink':
					t.UnLink();
					return true;

				// Bundle these together
				case 'JustifyLeft':
				case 'JustifyCenter':
				case 'JustifyRight':
				case 'JustifyFull':
					t.mceJustify(cmd, cmd.substring(7).toLowerCase());
					return true;

				default:
					f = this[cmd];

					if (f) {
						f.call(this, ui, val);
						return true;
					}
			}

			return false;
		},

		Indent : function() {
			var ed = this.editor, d = ed.dom, s = ed.selection, e, iv, iu;

			// Setup indent level
			iv = ed.settings.indentation;
			iu = /[a-z%]+$/i.exec(iv);
			iv = parseInt(iv);

			if (ed.settings.inline_styles && (!this.queryStateInsertUnorderedList() && !this.queryStateInsertOrderedList())) {
				each(s.getSelectedBlocks(), function(e) {
					d.setStyle(e, 'paddingLeft', (parseInt(e.style.paddingLeft || 0) + iv) + iu);
				});

				return;
			}

			ed.getDoc().execCommand('Indent', false, null);

			if (isIE) {
				d.getParent(s.getNode(), function(n) {
					if (n.nodeName == 'BLOCKQUOTE') {
						n.dir = n.style.cssText = '';
					}
				});
			}
		},

		Outdent : function() {
			var ed = this.editor, d = ed.dom, s = ed.selection, e, v, iv, iu;

			// Setup indent level
			iv = ed.settings.indentation;
			iu = /[a-z%]+$/i.exec(iv);
			iv = parseInt(iv);

			if (ed.settings.inline_styles && (!this.queryStateInsertUnorderedList() && !this.queryStateInsertOrderedList())) {
				each(s.getSelectedBlocks(), function(e) {
					v = Math.max(0, parseInt(e.style.paddingLeft || 0) - iv);
					d.setStyle(e, 'paddingLeft', v ? v + iu : '');
				});

				return;
			}

			ed.getDoc().execCommand('Outdent', false, null);
		},

/*
		mceSetAttribute : function(u, v) {
			var ed = this.editor, d = ed.dom, e;

			if (e = d.getParent(ed.selection.getNode(), d.isBlock))
				d.setAttrib(e, v.name, v.value);
		},
*/
		mceSetContent : function(u, v) {
			this.editor.setContent(v);
		},

		mceToggleVisualAid : function() {
			var ed = this.editor;

			ed.hasVisual = !ed.hasVisual;
			ed.addVisual();
		},

		mceReplaceContent : function(u, v) {
			var s = this.editor.selection;

			s.setContent(v.replace(/\{\$selection\}/g, s.getContent({format : 'text'})));
		},

		mceInsertLink : function(u, v) {
			var ed = this.editor, s = ed.selection, e = ed.dom.getParent(s.getNode(), 'a');

			if (tinymce.is(v, 'string'))
				v = {href : v};

			function set(e) {
				each(v, function(v, k) {
					ed.dom.setAttrib(e, k, v);
				});
			};

			if (!e) {
				ed.execCommand('CreateLink', false, 'javascript:mctmp(0);');
				each(ed.dom.select('a[href=javascript:mctmp(0);]'), function(e) {
					set(e);
				});
			} else {
				if (v.href)
					set(e);
				else
					ed.dom.remove(e, 1);
			}
		},

		Italic : function() {
			this._toggle('italic_format');
		},

		queryStateItalic : function() {
			return this._match('italic_format');
		},

		Bold : function() {
			this._toggle('bold_format');
		},

		queryStateBold : function() {
			return this._match('bold_format');
		},

		Underline : function() {
			this._toggle('underline_format');
		},

		queryStateUnderline : function() {
			return this._match('underline_format');
		},

		Strikethrough : function() {
			this._toggle('strikethrough_format');
		},

		queryStateStrikethrough : function() {
			return this._match('strikethrough_format');
		},

		ForeColor : function(ui, v) {
			this._toggle('forecolor_format', v);
		},

		HiliteColor : function(ui, v) {
			this._toggle('hilitecolor_format', v);
		},

		RemoveFormat : function() {
			this.editor.formatter.remove(this.editor.settings.removeformat);
		},

		FontName : function(u, v) {
			this._toggle('fontname_format', v);
		},

		FontSize : function(u, v) {
			var ed = this.editor, settings = ed.settings, fontClasses, fontSizes;

			// Convert font size 1-7 to styles
			if (v >= 1 && v <= 7) {
				fontSizes = tinymce.explode(settings.font_size_style_values);
				fontClasses = tinymce.explode(settings.font_size_classes);

				if (fontClasses)
					v = fontClasses[v - 1] || v;
				else
					v = fontSizes[v - 1] || v;
			}

			this._toggle('fontsize_format', v);
		},

		UnLink : function() {
			var ed = this.editor, s = ed.selection;

			if (s.isCollapsed())
				s.select(s.getNode());

			ed.getDoc().execCommand('unlink', false, null);
			s.collapse(0);
		},

		queryCommandValue : function(c) {
			var f = this['queryValue' + c];

			if (f)
				return f.call(this, c);

			return false;
		},

		queryCommandState : function(cmd) {
			var f;

			switch (cmd) {
				// Bundle these together
				case 'JustifyLeft':
				case 'JustifyCenter':
				case 'JustifyRight':
				case 'JustifyFull':
					return this.queryStateJustify(cmd, cmd.substring(7).toLowerCase());

				default:
					if (f = this['queryState' + cmd])
						return f.call(this, cmd);
			}

			return -1;
		},

		_queryState : function(c) {
			try {
				return this.editor.getDoc().queryCommandState(c);
			} catch (ex) {
				// Ignore exception
			}
		},

		queryValueFontSize : function() {
			var ed = this.editor, v = 0, p;

			if (p = ed.dom.getParent(ed.selection.getNode(), 'span'))
				v = p.style.fontSize;

			return v;
		},

		queryValueFontName : function() {
			var ed = this.editor, v, p;

			if (p = ed.dom.getParent(ed.selection.getNode(), 'span'))
				v = p.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();

			return v;
		},

		mceJustify : function(c, v) {
			var ed = this.editor;

			return ed.formatter.toggle(ed.settings.align_formats[v]);
		},

		queryStateJustify : function(c, v) {
			var ed = this.editor;

			return ed.formatter.match(ed.settings.align_formats[v]);
		},

		FormatBlock : function(ui, val) {
			return this.editor.formatter.toggle({block : val, remove : 'all'});
		},

		mceCleanup : function() {
			var ed = this.editor, sel = ed.selection, bookmark = sel.getBookmark();

			ed.setContent(ed.getContent({cleanup : true}));

			sel.moveToBookmark(bookmark);
		},

		mceRemoveNode : function(ui, val) {
			var ed = this.editor, s = ed.selection, b, n = val || s.getNode();

			// Make sure that the body node isn't removed
			if (n == ed.getBody())
				return;

			b = s.getBookmark();
			ed.dom.remove(n, 1);
			s.moveToBookmark(b);
			ed.nodeChanged();
		},

		mceSelectNodeDepth : function(ui, val) {
			var ed = this.editor, s = ed.selection, c = 0;

			ed.dom.getParent(s.getNode(), function(n) {
				if (n.nodeType == 1 && c++ == val) {
					s.select(n);
					ed.nodeChanged();
					return false;
				}
			}, ed.getBody());
		},

		mceSelectNode : function(u, v) {
			this.editor.selection.select(v);
		},

		mceInsertContent : function(ui, val) {
			this.editor.selection.setContent(val);
		},

		mceInsertRawHTML : function(ui, val) {
			var ed = this.editor;

			ed.selection.setContent('tiny_mce_marker');
			ed.setContent(ed.getContent().replace(/tiny_mce_marker/g, val));
		},

		mceRepaint : function() {
			var s, b, e = this.editor;

			if (tinymce.isGecko) {
				try {
					s = e.selection;
					b = s.getBookmark(true);

					if (s.getSel())
						s.getSel().selectAllChildren(e.getBody());

					s.collapse(true);
					s.moveToBookmark(b);
				} catch (ex) {
					// Ignore
				}
			}
		},

		queryStateOutdent : function() {
			var ed = this.editor, n;

			if (ed.settings.inline_styles) {
				if ((n = ed.dom.getParent(ed.selection.getStart(), ed.dom.isBlock)) && parseInt(n.style.paddingLeft) > 0)
					return true;

				if ((n = ed.dom.getParent(ed.selection.getEnd(), ed.dom.isBlock)) && parseInt(n.style.paddingLeft) > 0)
					return true;
			}

			return this.queryStateInsertUnorderedList() || this.queryStateInsertOrderedList() || (!ed.settings.inline_styles && !!ed.dom.getParent(ed.selection.getNode(), 'BLOCKQUOTE'));
		},

		queryStateInsertUnorderedList : function() {
			return this.editor.dom.getParent(this.editor.selection.getNode(), 'UL');
		},

		queryStateInsertOrderedList : function() {
			return this.editor.dom.getParent(this.editor.selection.getNode(), 'OL');
		},

		queryStatemceBlockQuote : function() {
			return !!this.editor.dom.getParent(this.editor.selection.getStart(), function(n) {return n.nodeName === 'BLOCKQUOTE';});
		},

		_match : function(name) {
			var ed = this.editor;

			return ed.formatter.match(ed.settings[name]);
		},

		_toggle : function(name, val) {
			var ed = this.editor, vars;

			if (val)
				vars = {value : val};

			ed.formatter.toggle(ed.settings[name], vars);
		},
	});
})(tinymce);