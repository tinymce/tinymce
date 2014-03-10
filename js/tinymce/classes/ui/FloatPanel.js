/**
 * FloatPanel.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
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
	"tinymce/ui/DomUtils"
], function(Panel, Movable, Resizable, DomUtils) {
	"use strict";

	var documentClickHandler, documentScrollHandler, visiblePanels = [];
	var zOrder = [], hasModal;

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

			function reorder() {
				var i, zIndex = FloatPanel.zIndex || 0xFFFF, topModal;

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

				var modalBlockEl = document.getElementById(self.classPrefix + 'modal-block');

				if (topModal) {
					DomUtils.css(modalBlockEl, 'z-index', topModal.zIndex - 1);
				} else if (modalBlockEl) {
					modalBlockEl.parentNode.removeChild(modalBlockEl);
					hasModal = false;
				}

				FloatPanel.currentZIndex = zIndex;
			}

			function isChildOf(ctrl, parent) {
				while (ctrl) {
					if (ctrl == parent) {
						return true;
					}

					ctrl = ctrl.parent();
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
					if (!panel._fixed) {
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

			self._super(settings);
			self._eventsRoot = self;

			self.addClass('floatpanel');

			// Hide floatpanes on click out side the root button
			if (settings.autohide) {
				if (!documentClickHandler) {
					documentClickHandler = function(e) {
						// Hide any float panel when a click is out side that float panel and the
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
					};

					DomUtils.on(document, 'click', documentClickHandler);
				}

				visiblePanels.push(self);
			}

			if (settings.autofix) {
				if (!documentScrollHandler) {
					documentScrollHandler = function() {
						var i;

						i = visiblePanels.length;
						while (i--) {
							repositionPanel(visiblePanels[i]);
						}
					};

					DomUtils.on(window, 'scroll', documentScrollHandler);
				}

				self.on('move', function() {
					repositionPanel(this);
				});
			}

			self.on('postrender show', function(e) {
				if (e.control == self) {
					var modalBlockEl, prefix = self.classPrefix;

					if (self.modal && !hasModal) {
						modalBlockEl = DomUtils.createFragment('<div id="' + prefix + 'modal-block" class="' +
							prefix + 'reset ' + prefix + 'fade"></div>');
						modalBlockEl = modalBlockEl.firstChild;

						self.getContainerElm().appendChild(modalBlockEl);

						setTimeout(function() {
							DomUtils.addClass(modalBlockEl, prefix + 'in');
							DomUtils.addClass(self.getEl(), prefix + 'in');
						}, 0);

						hasModal = true;
					}

					zOrder.push(self);
					reorder();
				}
			});

			self.on('close hide', function(e) {
				if (e.control == self) {
					var i = zOrder.length;

					while (i--) {
						if (zOrder[i] === self) {
							zOrder.splice(i, 1);
						}
					}

					reorder();
				}
			});

			self.on('show', function() {
				self.parents().each(function(ctrl) {
					if (ctrl._fixed) {
						self.fixed(true);
						return false;
					}
				});
			});

			if (settings.popover) {
				self._preBodyHtml = '<div class="' + self.classPrefix + 'arrow"></div>';
				self.addClass('popover').addClass('bottom').addClass(self.isRtl() ? 'end' : 'start');
			}
		},

		fixed: function(state) {
			var self = this;

			if (self._fixed != state) {
				if (self._rendered) {
					var viewport = DomUtils.getViewPort();

					if (state) {
						self.layoutRect().y -= viewport.y;
					} else {
						self.layoutRect().y += viewport.y;
					}
				}

				self.toggleClass('fixed', state);
				self._fixed = state;
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
			return this._super();
		},

		/**
		 * Hides all visible the float panels.
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

			self.fire('close');

			return self.remove();
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
	 * Hides all visible the float panels.
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