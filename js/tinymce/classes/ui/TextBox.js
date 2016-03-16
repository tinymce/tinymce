/**
 * TextBox.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new textbox.
 *
 * @-x-less TextBox.less
 * @class tinymce.ui.TextBox
 * @extends tinymce.ui.Widget
 */
define("tinymce/ui/TextBox", [
	"tinymce/ui/Widget"
], function(Widget) {
	"use strict";

	return Widget.extend({
		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} multiline True if the textbox is a multiline control.
		 * @setting {Number} maxLength Max length for the textbox.
		 * @setting {Number} size Size of the textbox in characters.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			self.classes.add('textbox');

			if (settings.multiline) {
				self.classes.add('multiline');
			} else {
				self.on('keydown', function(e) {
					var rootControl;

					if (e.keyCode == 13) {
						e.preventDefault();

						// Find root control that we can do toJSON on
						self.parents().reverse().each(function(ctrl) {
							if (ctrl.toJSON) {
								rootControl = ctrl;
								return false;
							}
						});

						// Fire event on current text box with the serialized data of the whole form
						self.fire('submit', {data: rootControl.toJSON()});
					}
				});

				self.on('keyup', function(e) {
					self.state.set('value', e.target.value);
				});
			}
		},

		/**
		 * Repaints the control after a layout operation.
		 *
		 * @method repaint
		 */
		repaint: function() {
			var self = this, style, rect, borderBox, borderW, borderH = 0, lastRepaintRect;

			style = self.getEl().style;
			rect = self._layoutRect;
			lastRepaintRect = self._lastRepaintRect || {};

			// Detect old IE 7+8 add lineHeight to align caret vertically in the middle
			var doc = document;
			if (!self.settings.multiline && doc.all && (!doc.documentMode || doc.documentMode <= 8)) {
				style.lineHeight = (rect.h - borderH) + 'px';
			}

			borderBox = self.borderBox;
			borderW = borderBox.left + borderBox.right + 8;
			borderH = borderBox.top + borderBox.bottom + (self.settings.multiline ? 8 : 0);

			if (rect.x !== lastRepaintRect.x) {
				style.left = rect.x + 'px';
				lastRepaintRect.x = rect.x;
			}

			if (rect.y !== lastRepaintRect.y) {
				style.top = rect.y + 'px';
				lastRepaintRect.y = rect.y;
			}

			if (rect.w !== lastRepaintRect.w) {
				style.width = (rect.w - borderW) + 'px';
				lastRepaintRect.w = rect.w;
			}

			if (rect.h !== lastRepaintRect.h) {
				style.height = (rect.h - borderH) + 'px';
				lastRepaintRect.h = rect.h;
			}

			self._lastRepaintRect = lastRepaintRect;
			self.fire('repaint', {}, false);

			return self;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this,
				settings = self.settings,
				element = document.createElement( settings.multiline ? 'textarea' : 'input' ),
				/*
				 * For these, the key is what is set, the value is the html attribute
				 * it will go into.  This will make it easier for legacy or shifting
				 * keys to values, like subtype maps to html input type.
				 */
				extraAttrs = {
					rows : 'rows',
					spellcheck : 'spellcheck',
					maxLength : 'maxLength',
					size : 'size',
					readonly : 'readonly',
					min : 'min',
					max : 'max',
					step : 'step',
					list : 'list',
					pattern : 'pattern',
					placeholder : 'placeholder',
					required : 'required',
					multiple : 'multiple' // Multiple may be used with the `email` subtype
				};

			for (var key in extraAttrs) {
				if (typeof settings[ key ] !== 'undefined') {
					element.setAttribute(extraAttrs[ key ], settings[ key ]);
				}
			}

			if (settings.multiline) {
				element.innerText = self.state.get('value');
			} else {
				element.setAttribute('type', settings.subtype ? settings.subtype : 'text');
				element.setAttribute('value', self.state.get('value'));
			}

			element.id = self._id;
			element.className = self.classes;
			element.setAttribute( 'hidefocus', 1 );
			if (self.disabled()) {
				element.disabled = true;
			}

			return element.outerHTML;
		},

		value: function(value) {
			if (arguments.length) {
				this.state.set('value', value);
				return this;
			}

			// Make sure the real state is in sync
			if (this.state.get('rendered')) {
				this.state.set('value', this.getEl().value);
			}

			return this.state.get('value');
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this;

			self._super();

			self.$el.on('change', function(e) {
				self.state.set('value', e.target.value);
				self.fire('change', e);
			});
		},

		bindStates: function() {
			var self = this;

			self.state.on('change:value', function(e) {
				if (self.getEl().value != e.value) {
					self.getEl().value = e.value;
				}
			});

			self.state.on('change:disabled', function(e) {
				self.getEl().disabled = e.value;
			});

			return self._super();
		},

		remove: function() {
			this.$el.off();
			this._super();
		}
	});
});
