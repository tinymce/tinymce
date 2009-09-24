/**
 * SplitButton.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	/**
	 * This class is used to create a split button. A button with a menu attached to it.
	 *
	 * @class tinymce.ui.SplitButton
	 * @extends tinymce.ui.Button
	 */
	tinymce.create('tinymce.ui.SplitButton:tinymce.ui.MenuButton', {
		/**
		 * Constructs a new split button control instance.
		 *
		 * @constructor
		 * @method SplitButton
		 * @param {String} id Control id for the split button.
		 * @param {Object} s Optional name/value settings object.
		 */
		SplitButton : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceSplitButton';
		},

		/**
		 * Renders the split button as a HTML string. This method is much faster than using the DOM and when
		 * creating a whole toolbar with buttons it does make a lot of difference.
		 *
		 * @method renderHTML
		 * @return {String} HTML for the split button control element.
		 */
		renderHTML : function() {
			var h, t = this, s = t.settings, h1;

			h = '<tbody><tr>';

			if (s.image)
				h1 = DOM.createHTML('img ', {src : s.image, 'class' : 'mceAction ' + s['class']});
			else
				h1 = DOM.createHTML('span', {'class' : 'mceAction ' + s['class']}, '');

			h += '<td>' + DOM.createHTML('a', {id : t.id + '_action', href : 'javascript:;', 'class' : 'mceAction ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';
	
			h1 = DOM.createHTML('span', {'class' : 'mceOpen ' + s['class']});
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', href : 'javascript:;', 'class' : 'mceOpen ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';

			h += '</tr></tbody>';

			return DOM.createHTML('table', {id : t.id, 'class' : 'mceSplitButton mceSplitButtonEnabled ' + s['class'], cellpadding : '0', cellspacing : '0', onmousedown : 'return false;', title : s.title}, h);
		},

		/**
		 * Post render handler. This function will be called after the UI has been
		 * rendered so that events can be added.
		 *
		 * @method postRender
		 */
		postRender : function() {
			var t = this, s = t.settings;

			if (s.onclick) {
				Event.add(t.id + '_action', 'click', function() {
					if (!t.isDisabled())
						s.onclick(t.value);
				});
			}

			Event.add(t.id + '_open', 'click', t.showMenu, t);
			Event.add(t.id + '_open', 'focus', function() {t._focused = 1;});
			Event.add(t.id + '_open', 'blur', function() {t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.addClass(t.id, 'mceSplitButtonHover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.removeClass(t.id, 'mceSplitButtonHover');
				});
			}
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_action');
			Event.clear(this.id + '_open');
		}
	});
})(tinymce);
