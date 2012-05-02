/**
 * Button.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM;

	/**
	 * This class is used to create a UI button. A button is basically a link
	 * that is styled to look like a button or icon.
	 *
	 * @class tinymce.ui.Button
	 * @extends tinymce.ui.Control
	 */
	tinymce.create('tinymce.ui.Button:tinymce.ui.Control', {
		/**
		 * Constructs a new button control instance.
		 *
		 * @constructor
		 * @method Button
		 * @param {String} id Control id for the button.
		 * @param {Object} s Optional name/value settings object.
		 * @param {Editor} ed Optional the editor instance this button is for.
		 */
		Button : function(id, s, ed) {
			this.parent(id, s, ed);
			this.classPrefix = 'mceButton';
		},

		/**
		 * Renders the button as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the button control element.
		 */
		renderHTML : function() {
			var cp = this.classPrefix, s = this.settings, h, l;

			l = DOM.encode(s.label || '');
			h = '<a role="button" id="' + this.id + '" href="javascript:;" class="' + cp + ' ' + cp + 'Enabled ' + s['class'] + (l ? ' ' + cp + 'Labeled' : '') +'" onmousedown="return false;" onclick="return false;" aria-labelledby="' + this.id + '_voice" title="' + DOM.encode(s.title) + '">';
			if (s.image && !(this.editor  &&this.editor.forcedHighContrastMode) )
				h += '<img class="mceIcon" src="' + s.image + '" alt="' + DOM.encode(s.title) + '" />' + l;
			else
				h += '<span class="mceIcon ' + s['class'] + '"></span>' + (l ? '<span class="' + cp + 'Label">' + l + '</span>' : '');

			h += '<span class="mceVoiceLabel mceIconOnly" style="display: none;" id="' + this.id + '_voice">' + s.title + '</span>'; 
			h += '</a>';
			return h;
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, s = t.settings, imgBookmark;

			// In IE a large image that occupies the entire editor area will be deselected when a button is clicked, so
			// need to keep the selection in case the selection is lost
			if (tinymce.isIE && t.editor) {
				tinymce.dom.Event.add(t.id, 'mousedown', function(e) {
					var nodeName = t.editor.selection.getNode().nodeName;
					imgBookmark = nodeName === 'IMG' ? t.editor.selection.getBookmark() : null;
				});
			}
			tinymce.dom.Event.add(t.id, 'click', function(e) {
				if (!t.isDisabled()) {
					// restore the selection in case the selection is lost in IE
					if (tinymce.isIE && t.editor && imgBookmark !== null) {
						t.editor.selection.moveToBookmark(imgBookmark);
					}
					return s.onclick.call(s.scope, e);
				}
			});
			tinymce.dom.Event.add(t.id, 'keyup', function(e) {
				if (!t.isDisabled() && e.keyCode==tinymce.VK.SPACEBAR)
					return s.onclick.call(s.scope, e);
			});
		}
	});
})(tinymce);
