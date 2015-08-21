/**
 * Window.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Creates a new window.
 *
 * @-x-less Window.less
 * @class tinymce.ui.Window
 * @extends tinymce.ui.FloatPanel
 */
define("tinymce/ui/Window", [
	"tinymce/ui/FloatPanel",
	"tinymce/ui/Panel",
	"tinymce/ui/DomUtils",
	"tinymce/dom/DomQuery",
	"tinymce/ui/DragHelper",
	"tinymce/ui/BoxUtils",
	"tinymce/Env"
], function(FloatPanel, Panel, DomUtils, $, DragHelper, BoxUtils, Env) {
	"use strict";

	var windows = [], oldMetaValue = '';

	function toggleFullScreenState(state) {
		var noScaleMetaValue = 'width=device-width,initial-scale=1.0,user-scalable=0,minimum-scale=1.0,maximum-scale=1.0',
			viewport = $("meta[name=viewport]")[0],
			contentValue;

		if (Env.overrideViewPort === false) {
			return;
		}

		if (!viewport) {
			viewport = document.createElement('meta');
			viewport.setAttribute('name', 'viewport');
			document.getElementsByTagName('head')[0].appendChild(viewport);
		}

		contentValue = viewport.getAttribute('content');
		if (contentValue && typeof oldMetaValue != 'undefined') {
			oldMetaValue = contentValue;
		}

		viewport.setAttribute('content', state ? noScaleMetaValue : oldMetaValue);
	}

	function toggleBodyFullScreenClasses(classPrefix) {
		for (var i = 0; i < windows.length; i++) {
			if (windows[i]._fullscreen) {
				return;
			}
		}

		$([document.documentElement, document.body]).removeClass(classPrefix + 'fullscreen');
	}

	function handleWindowResize() {
		var lastSize = {
			w: window.innerWidth,
			h: window.innerHeight
		};

		window.setInterval(function() {
			var w = window.innerWidth,
				h = window.innerHeight;

			if (lastSize.w != w || lastSize.h != h) {
				lastSize = {
					w: w,
					h: h
				};

				$(window).trigger('resize');
			}
		}, 0);

		function reposition() {
			var i, rect = DomUtils.getWindowSize(), layoutRect;

			for (i = 0; i < windows.length; i++) {
				layoutRect = windows[i].layoutRect();

				windows[i].moveTo(
					windows[i].settings.x || Math.max(0, rect.w / 2 - layoutRect.w / 2),
					windows[i].settings.y || Math.max(0, rect.h / 2 - layoutRect.h / 2)
				);
			}
		}

		$(window).on('resize', reposition);
	}

	var Window = FloatPanel.extend({
		modal: true,

		Defaults: {
			border: 1,
			layout: 'flex',
			containerCls: 'panel',
			role: 'dialog',
			callbacks: {
				submit: function() {
					this.fire('submit', {data: this.toJSON()});
				},

				close: function() {
					this.close();
				}
			}
		},

		/**
		 * Constructs a instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);

			if (self.isRtl()) {
				self.classes.add('rtl');
			}

			self.classes.add('window');
			self.bodyClasses.add('window-body');
			self.state.set('fixed', true);

			// Create statusbar
			if (settings.buttons) {
				self.statusbar = new Panel({
					layout: 'flex',
					border: '1 0 0 0',
					spacing: 3,
					padding: 10,
					align: 'center',
					pack: self.isRtl() ? 'start' : 'end',
					defaults: {
						type: 'button'
					},
					items: settings.buttons
				});

				self.statusbar.classes.add('foot');
				self.statusbar.parent(self);
			}

			self.on('click', function(e) {
				if (e.target.className.indexOf(self.classPrefix + 'close') != -1) {
					self.close();
				}
			});

			self.on('cancel', function() {
				self.close();
			});

			self.aria('describedby', self.describedBy || self._id + '-none');
			self.aria('label', settings.title);
			self._fullscreen = false;
		},

		/**
		 * Recalculates the positions of the controls in the current container.
		 * This is invoked by the reflow method and shouldn't be called directly.
		 *
		 * @method recalc
		 */
		recalc: function() {
			var self = this, statusbar = self.statusbar, layoutRect, width, x, needsRecalc;

			if (self._fullscreen) {
				self.layoutRect(DomUtils.getWindowSize());
				self.layoutRect().contentH = self.layoutRect().innerH;
			}

			self._super();

			layoutRect = self.layoutRect();

			// Resize window based on title width
			if (self.settings.title && !self._fullscreen) {
				width = layoutRect.headerW;
				if (width > layoutRect.w) {
					x = layoutRect.x - Math.max(0, width / 2);
					self.layoutRect({w: width, x: x});
					needsRecalc = true;
				}
			}

			// Resize window based on statusbar width
			if (statusbar) {
				statusbar.layoutRect({w: self.layoutRect().innerW}).recalc();

				width = statusbar.layoutRect().minW + layoutRect.deltaW;
				if (width > layoutRect.w) {
					x = layoutRect.x - Math.max(0, width - layoutRect.w);
					self.layoutRect({w: width, x: x});
					needsRecalc = true;
				}
			}

			// Recalc body and disable auto resize
			if (needsRecalc) {
				self.recalc();
			}
		},

		/**
		 * Initializes the current controls layout rect.
		 * This will be executed by the layout managers to determine the
		 * default minWidth/minHeight etc.
		 *
		 * @method initLayoutRect
		 * @return {Object} Layout rect instance.
		 */
		initLayoutRect: function() {
			var self = this, layoutRect = self._super(), deltaH = 0, headEl;

			// Reserve vertical space for title
			if (self.settings.title && !self._fullscreen) {
				headEl = self.getEl('head');

				var size = DomUtils.getSize(headEl);

				layoutRect.headerW = size.width;
				layoutRect.headerH = size.height;

				deltaH += layoutRect.headerH;
			}

			// Reserve vertical space for statusbar
			if (self.statusbar) {
				deltaH += self.statusbar.layoutRect().h;
			}

			layoutRect.deltaH += deltaH;
			layoutRect.minH += deltaH;
			//layoutRect.innerH -= deltaH;
			layoutRect.h += deltaH;

			var rect = DomUtils.getWindowSize();

			layoutRect.x = self.settings.x || Math.max(0, rect.w / 2 - layoutRect.w / 2);
			layoutRect.y = self.settings.y || Math.max(0, rect.h / 2 - layoutRect.h / 2);

			return layoutRect;
		},

		/**
		 * Renders the control as a HTML string.
		 *
		 * @method renderHtml
		 * @return {String} HTML representing the control.
		 */
		renderHtml: function() {
			var self = this, layout = self._layout, id = self._id, prefix = self.classPrefix;
			var settings = self.settings, headerHtml = '', footerHtml = '', html = settings.html;

			self.preRender();
			layout.preRender(self);

			if (settings.title) {
				headerHtml = (
					'<div id="' + id + '-head" class="' + prefix + 'window-head">' +
						'<div id="' + id + '-title" class="' + prefix + 'title">' + self.encode(settings.title) + '</div>' +
						'<button type="button" class="' + prefix + 'close" aria-hidden="true">\u00d7</button>' +
						'<div id="' + id + '-dragh" class="' + prefix + 'dragh"></div>' +
					'</div>'
				);
			}

			if (settings.url) {
				html = '<iframe src="' + settings.url + '" tabindex="-1"></iframe>';
			}

			if (typeof html == "undefined") {
				html = layout.renderHtml(self);
			}

			if (self.statusbar) {
				footerHtml = self.statusbar.renderHtml();
			}

			return (
				'<div id="' + id + '" class="' + self.classes + '" hidefocus="1">' +
					'<div class="' + self.classPrefix + 'reset" role="application">' +
						headerHtml +
						'<div id="' + id + '-body" class="' + self.bodyClasses + '">' +
							html +
						'</div>' +
						footerHtml +
					'</div>' +
				'</div>'
			);
		},

		/**
		 * Switches the window fullscreen mode.
		 *
		 * @method fullscreen
		 * @param {Boolean} state True/false state.
		 * @return {tinymce.ui.Window} Current window instance.
		 */
		fullscreen: function(state) {
			var self = this, documentElement = document.documentElement, slowRendering, prefix = self.classPrefix, layoutRect;

			if (state != self._fullscreen) {
				$(window).on('resize', function() {
					var time;

					if (self._fullscreen) {
						// Time the layout time if it's to slow use a timeout to not hog the CPU
						if (!slowRendering) {
							time = new Date().getTime();

							var rect = DomUtils.getWindowSize();
							self.moveTo(0, 0).resizeTo(rect.w, rect.h);

							if ((new Date().getTime()) - time > 50) {
								slowRendering = true;
							}
						} else {
							if (!self._timer) {
								self._timer = setTimeout(function() {
									var rect = DomUtils.getWindowSize();
									self.moveTo(0, 0).resizeTo(rect.w, rect.h);

									self._timer = 0;
								}, 50);
							}
						}
					}
				});

				layoutRect = self.layoutRect();
				self._fullscreen = state;

				if (!state) {
					self.borderBox = BoxUtils.parseBox(self.settings.border);
					self.getEl('head').style.display = '';
					layoutRect.deltaH += layoutRect.headerH;
					$([documentElement, document.body]).removeClass(prefix + 'fullscreen');
					self.classes.remove('fullscreen');
					self.moveTo(self._initial.x, self._initial.y).resizeTo(self._initial.w, self._initial.h);
				} else {
					self._initial = {x: layoutRect.x, y: layoutRect.y, w: layoutRect.w, h: layoutRect.h};

					self.borderBox = BoxUtils.parseBox('0');
					self.getEl('head').style.display = 'none';
					layoutRect.deltaH -= layoutRect.headerH + 2;
					$([documentElement, document.body]).addClass(prefix + 'fullscreen');
					self.classes.add('fullscreen');

					var rect = DomUtils.getWindowSize();
					self.moveTo(0, 0).resizeTo(rect.w, rect.h);
				}
			}

			return self.reflow();
		},

		/**
		 * Called after the control has been rendered.
		 *
		 * @method postRender
		 */
		postRender: function() {
			var self = this, startPos;

			setTimeout(function() {
				self.classes.add('in');
			}, 0);

			self._super();

			if (self.statusbar) {
				self.statusbar.postRender();
			}

			self.focus();

			this.dragHelper = new DragHelper(self._id + '-dragh', {
				start: function() {
					startPos = {
						x: self.layoutRect().x,
						y: self.layoutRect().y
					};
				},

				drag: function(e) {
					self.moveTo(startPos.x + e.deltaX, startPos.y + e.deltaY);
				}
			});

			self.on('submit', function(e) {
				if (!e.isDefaultPrevented()) {
					self.close();
				}
			});

			windows.push(self);
			toggleFullScreenState(true);
		},

		/**
		 * Fires a submit event with the serialized form.
		 *
		 * @method submit
		 * @return {Object} Event arguments object.
		 */
		submit: function() {
			return this.fire('submit', {data: this.toJSON()});
		},

		/**
		 * Removes the current control from DOM and from UI collections.
		 *
		 * @method remove
		 * @return {tinymce.ui.Control} Current control instance.
		 */
		remove: function() {
			var self = this, i;

			self.dragHelper.destroy();
			self._super();

			if (self.statusbar) {
				this.statusbar.remove();
			}

			i = windows.length;
			while (i--) {
				if (windows[i] === self) {
					windows.splice(i, 1);
				}
			}

			toggleFullScreenState(windows.length > 0);
			toggleBodyFullScreenClasses(self.classPrefix);
		},

		/**
		 * Returns the contentWindow object of the iframe if it exists.
		 *
		 * @method getContentWindow
		 * @return {Window} window object or null.
		 */
		getContentWindow: function() {
			var ifr = this.getEl().getElementsByTagName('iframe')[0];
			return ifr ? ifr.contentWindow : null;
		}
	});

	if (!Env.desktop) {
		handleWindowResize();
	}

	return Window;
});