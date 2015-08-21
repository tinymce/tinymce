/**
 * FloatPanel.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class creates a floating panel.
 *
 * @-x-less FloatPanel.less
 * @class tinymce.ui.FloatPanel
 * @extends tinymce.ui.Panel
 * @mixes tinymce.ui.Movable
 * @mixes tinymce.ui.Resizable
 */
define("tinymce/ui/FloatPanel", [
	"tinymce/ui/Panel",
	"tinymce/ui/Movable",
	"tinymce/ui/Resizable",
	"tinymce/ui/DomUtils",
	"tinymce/dom/DomQuery"
], function(Panel, Movable, Resizable, DomUtils, $) {
	"use strict";

	var documentClickHandler, documentScrollHandler, windowResizeHandler, visiblePanels = [];
	var zOrder = [], hasModal;

	function isChildOf(ctrl, parent) {
		while (ctrl) {
			if (ctrl == parent) {
				return true;
			}

			ctrl = ctrl.parent();
		}
	}

	function skipOrHidePanels(e) {
		// Hide any float panel when a click/focus out is out side that float panel and the
		// float panels direct parent for example a click on a menu button
		var i = visiblePanels.length;

		while (i--) {
			var panel = visiblePanels[i], clickCtrl = panel.getParentCtrl(e.target);

			if (panel.settings.autohide) {
				if (clickCtrl) {
					if (isChildOf(clickCtrl, panel) || panel.parent() === clickCtrl) {
						continue;
					}
				}

				e = panel.fire('autohide', {target: e.target});
				if (!e.isDefaultPrevented()) {
					panel.hide();
				}
			}
		}
	}

	function bindDocumentClickHandler() {

		if (!documentClickHandler) {
			documentClickHandler = function(e) {
				// Gecko fires click event and in the wrong order on Mac so lets normalize
				if (e.button == 2) {
					return;
				}

				skipOrHidePanels(e);
			};

			$(document).on('click touchstart', documentClickHandler);
		}
	}

	function bindDocumentScrollHandler() {
		if (!documentScrollHandler) {
			documentScrollHandler = function() {
				var i;

				i = visiblePanels.length;
				while (i--) {
					repositionPanel(visiblePanels[i]);
				}
			};

			$(window).on('scroll', documentScrollHandler);
		}
	}

	function bindWindowResizeHandler() {
		if (!windowResizeHandler) {
			var docElm = document.documentElement, clientWidth = docElm.clientWidth, clientHeight = docElm.clientHeight;

			windowResizeHandler = function() {
				// Workaround for #7065 IE 7 fires resize events event though the window wasn't resized
				if (!document.all || clientWidth != docElm.clientWidth || clientHeight != docElm.clientHeight) {
					clientWidth = docElm.clientWidth;
					clientHeight = docElm.clientHeight;
					FloatPanel.hideAll();
				}
			};

			$(window).on('resize', windowResizeHandler);
		}
	}

	/**
	 * Repositions the panel to the top of page if the panel is outside of the visual viewport. It will
	 * also reposition all child panels of the current panel.
	 */
	function repositionPanel(panel) {
		var scrollY = DomUtils.getViewPort().y;

		function toggleFixedChildPanels(fixed, deltaY) {
			var parent;

			for (var i = 0; i < visiblePanels.length; i++) {
				if (visiblePanels[i] != panel) {
					parent = visiblePanels[i].parent();

					while (parent && (parent = parent.parent())) {
						if (parent == panel) {
							visiblePanels[i].fixed(fixed).moveBy(0, deltaY).repaint();
						}
					}
				}
			}
		}

		if (panel.settings.autofix) {
			if (!panel.state.get('fixed')) {
				panel._autoFixY = panel.layoutRect().y;

				if (panel._autoFixY < scrollY) {
					panel.fixed(true).layoutRect({y: 0}).repaint();
					toggleFixedChildPanels(true, scrollY - panel._autoFixY);
				}
			} else {
				if (panel._autoFixY > scrollY) {
					panel.fixed(false).layoutRect({y: panel._autoFixY}).repaint();
					toggleFixedChildPanels(false, panel._autoFixY - scrollY);
				}
			}
		}
	}

	function addRemove(add, ctrl) {
		var i, zIndex = FloatPanel.zIndex || 0xFFFF, topModal;

		if (add) {
			zOrder.push(ctrl);
		} else {
			i = zOrder.length;

			while (i--) {
				if (zOrder[i] === ctrl) {
					zOrder.splice(i, 1);
				}
			}
		}

		if (zOrder.length) {
			for (i = 0; i < zOrder.length; i++) {
				if (zOrder[i].modal) {
					zIndex++;
					topModal = zOrder[i];
				}

				zOrder[i].getEl().style.zIndex = zIndex;
				zOrder[i].zIndex = zIndex;
				zIndex++;
			}
		}

		var modalBlockEl = document.getElementById(ctrl.classPrefix + 'modal-block');

		if (topModal) {
			$(modalBlockEl).css('z-index', topModal.zIndex - 1);
		} else if (modalBlockEl) {
			modalBlockEl.parentNode.removeChild(modalBlockEl);
			hasModal = false;
		}

		FloatPanel.currentZIndex = zIndex;
	}

	var FloatPanel = Panel.extend({
		Mixins: [Movable, Resizable],

		/**
		 * Constructs a new control instance with the specified settings.
		 *
		 * @constructor
		 * @param {Object} settings Name/value object with settings.
		 * @setting {Boolean} autohide Automatically hide the panel.
		 */
		init: function(settings) {
			var self = this;

			self._super(settings);
			self._eventsRoot = self;

			self.classes.add('floatpanel');

			// Hide floatpanes on click out side the root button
			if (settings.autohide) {
				bindDocumentClickHandler();
				bindWindowResizeHandler();
				visiblePanels.push(self);
			}

			if (settings.autofix) {
				bindDocumentScrollHandler();

				self.on('move', function() {
					repositionPanel(this);
				});
			}

			self.on('postrender show', function(e) {
				if (e.control == self) {
					var $modalBlockEl, prefix = self.classPrefix;

					if (self.modal && !hasModal) {
						$modalBlockEl = $('#' + prefix + 'modal-block');
						if (!$modalBlockEl[0]) {
							$modalBlockEl = $(
								'<div id="' + prefix + 'modal-block" class="' + prefix + 'reset ' + prefix + 'fade"></div>'
							).appendTo(self.getContainerElm());
						}

						setTimeout(function() {
							$modalBlockEl.addClass(prefix + 'in');
							$(self.getEl()).addClass(prefix + 'in');
						}, 0);

						hasModal = true;
					}

					addRemove(true, self);
				}
			});

			self.on('show', function() {
				self.parents().each(function(ctrl) {
					if (ctrl.state.get('fixed')) {
						self.fixed(true);
						return false;
					}
				});
			});

			if (settings.popover) {
				self._preBodyHtml = '<div class="' + self.classPrefix + 'arrow"></div>';
				self.classes.add('popover').add('bottom').add(self.isRtl() ? 'end' : 'start');
			}
		},

		fixed: function(state) {
			var self = this;

			if (self.state.get('fixed') != state) {
				if (self.state.get('rendered')) {
					var viewport = DomUtils.getViewPort();

					if (state) {
						self.layoutRect().y -= viewport.y;
					} else {
						self.layoutRect().y += viewport.y;
					}
				}

				self.classes.toggle('fixed', state);
				self.state.set('fixed', state);
			}

			return self;
		},

		/**
		 * Shows the current float panel.
		 *
		 * @method show
		 * @return {tinymce.ui.FloatPanel} Current floatpanel instance.
		 */
		show: function() {
			var self = this, i, state = self._super();

			i = visiblePanels.length;
			while (i--) {
				if (visiblePanels[i] === self) {
					break;
				}
			}

			if (i === -1) {
				visiblePanels.push(self);
			}

			return state;
		},

		/**
		 * Hides the current float panel.
		 *
		 * @method hide
		 * @return {tinymce.ui.FloatPanel} Current floatpanel instance.
		 */
		hide: function() {
			removeVisiblePanel(this);
			addRemove(false, this);

			return this._super();
		},

		/**
		 * Hide all visible float panels with he autohide setting enabled. This is for
		 * manually hiding floating menus or panels.
		 *
		 * @method hideAll
		 */
		hideAll: function() {
			FloatPanel.hideAll();
		},

		/**
		 * Closes the float panel. This will remove the float panel from page and fire the close event.
		 *
		 * @method close
		 */
		close: function() {
			var self = this;

			if (!self.fire('close').isDefaultPrevented()) {
				self.remove();
				addRemove(false, self);
			}

			return self;
		},

		/**
		 * Removes the float panel from page.
		 *
		 * @method remove
		 */
		remove: function() {
			removeVisiblePanel(this);
			this._super();
		},

		postRender: function() {
			var self = this;

			if (self.settings.bodyRole) {
				this.getEl('body').setAttribute('role', self.settings.bodyRole);
			}

			return self._super();
		}
	});

	/**
	 * Hide all visible float panels with he autohide setting enabled. This is for
	 * manually hiding floating menus or panels.
	 *
	 * @static
	 * @method hideAll
	 */
	FloatPanel.hideAll = function() {
		var i = visiblePanels.length;

		while (i--) {
			var panel = visiblePanels[i];

			if (panel && panel.settings.autohide) {
				panel.hide();
				visiblePanels.splice(i, 1);
			}
		}
	};

	function removeVisiblePanel(panel) {
		var i;

		i = visiblePanels.length;
		while (i--) {
			if (visiblePanels[i] === panel) {
				visiblePanels.splice(i, 1);
			}
		}

		i = zOrder.length;
		while (i--) {
			if (zOrder[i] === panel) {
				zOrder.splice(i, 1);
			}
		}
	}

	return FloatPanel;
});