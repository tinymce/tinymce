/**
 * KeyboardNavigation.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class handles keyboard navigation of controls and elements.
 *
 * @class tinymce.ui.KeyboardNavigation
 */
define("tinymce/ui/KeyboardNavigation", [
	"tinymce/ui/DomUtils"
], function(DomUtils) {
	"use strict";

	/**
	 * Create a new KeyboardNavigation instance to handle the focus for a specific element.
	 *
	 * @constructor
	 * @param {Object} settings the settings object to define how keyboard navigation works.
	 *
	 * @setting {tinymce.ui.Control} root the root control navigation focus movement is scoped to this root.
	 * @setting {Array} items an array containing the items to move focus between. Every object in this array must have an
	 *                        id attribute which maps to the actual DOM element and it must be able to have focus i.e. tabIndex=-1.
	 * @setting {Function} onCancel the callback for when the user presses escape or otherwise indicates canceling.
	 * @setting {Function} onAction (optional) the action handler to call when the user activates an item.
	 * @setting {Boolean} enableLeftRight (optional, default) when true, the up/down arrows move through items.
	 * @setting {Boolean} enableUpDown (optional) when true, the up/down arrows move through items.
	 * Note for both up/down and left/right explicitly set both enableLeftRight and enableUpDown to true.
	 */
	return function(settings) {
		var root = settings.root, enableUpDown = settings.enableUpDown !== false;
		var enableLeftRight = settings.enableLeftRight !== false;
		var items = settings.items, focussedId;

		/**
		 * Initializes the items array if needed. This will collect items/elements
		 * from the specified root control.
		 */
		function initItems() {
			if (!items) {
				items = [];

				if (root.find) {
					// Root is a container then get child elements using the UI API
					root.find('*').each(function(ctrl) {
						if (ctrl.canFocus) {
							items.push(ctrl.getEl());
						}
					});
				} else {
					// Root is a control/widget then get the child elements of that control
					var elements = root.getEl().getElementsByTagName('*');
					for (var i = 0; i < elements.length; i++) {
						if (elements[i].id && elements[i]) {
							items.push(elements[i]);
						}
					}
				}
			}
		}

		/**
		 * Returns the currently focused element.
		 *
		 * @private
		 * @return {Element} Currently focused element.
		 */
		function getFocusElement() {
			return document.getElementById(focussedId);
		}

		/**
		 * Returns the currently focused elements wai aria role.
		 *
		 * @private
		 * @param {Element} elm Optional element to get role from.
		 * @return {String} Role of specified element.
		 */
		function getRole(elm) {
			elm = elm || getFocusElement();

			return elm && elm.getAttribute('role');
		}

		/**
		 * Returns the role of the parent element.
		 *
		 * @private
		 * @param {Element} elm Optional element to get parent role from.
		 * @return {String} Role of the first parent that has a role.
		 */
		function getParentRole(elm) {
			var role, parent = elm || getFocusElement();

			while ((parent = parent.parentNode)) {
				if ((role = getRole(parent))) {
					return role;
				}
			}
		}

		/**
		 * Returns an wai aria property by name.
		 *
		 * @private
		 * @param {String} name Name of the aria property to get for example "disabled".
		 * @return {String} Aria property value.
		 */
		function getAriaProp(name) {
			var elm = document.getElementById(focussedId);

			if (elm) {
				return elm.getAttribute('aria-' + name);
			}
		}

		/**
		 * Executes the onAction event callback. This is when the user presses enter/space.
		 *
		 * @private
		 */
		function action() {
			var focusElm = getFocusElement();

			if (focusElm && (focusElm.nodeName == "TEXTAREA" || focusElm.type == "text")) {
				return;
			}

			if (settings.onAction) {
				settings.onAction(focussedId);
			} else {
				DomUtils.fire(getFocusElement(), 'click', {keyboard: true});
			}

			return true;
		}

		/**
		 * Cancels the current navigation. The same as pressing the Esc key.
		 *
		 * @method cancel
		 */
		function cancel() {
			var focusElm;

			if (settings.onCancel) {
				if ((focusElm = getFocusElement())) {
					focusElm.blur();
				}

				settings.onCancel();
			} else {
				settings.root.fire('cancel');
			}
		}

		/**
		 * Moves the focus to the next or previous item. It will wrap to start/end if it can't move.
		 *
		 * @method moveFocus
		 * @param {Number} dir Direction for move -1 or 1.
		 */
		function moveFocus(dir) {
			var idx = -1, focusElm, i;
			var visibleItems = [];

			function isVisible(elm) {
				var rootElm = root ? root.getEl() : document.body;

				while (elm && elm != rootElm) {
					if (elm.style.display == 'none') {
						return false;
					}

					elm = elm.parentNode;
				}

				return true;
			}

			initItems();

			// TODO: Optimize this, will be slow on lots of items
			i = visibleItems.length;
			for (i = 0; i < items.length; i++) {
				if (isVisible(items[i])) {
					visibleItems.push(items[i]);
				}
			}

			i = visibleItems.length;
			while (i--) {
				if (visibleItems[i].id === focussedId) {
					idx = i;
					break;
				}
			}

			idx += dir;
			if (idx < 0) {
				idx = visibleItems.length - 1;
			} else if (idx >= visibleItems.length) {
				idx = 0;
			}

			focusElm = visibleItems[idx];
			focusElm.focus();
			focussedId = focusElm.id;

			if (settings.actOnFocus) {
				action();
			}
		}

		/**
		 * Moves focus to the first item or the last focused item if root is a toolbar.
		 *
		 * @method focusFirst
		 * @return {[type]} [description]
		 */
		function focusFirst() {
			var i, rootRole;

			rootRole = getRole(settings.root.getEl());
			initItems();

			i = items.length;
			while (i--) {
				if (rootRole == 'toolbar' && items[i].id === focussedId) {
					items[i].focus();
					return;
				}
			}

			items[0].focus();
		}

		// Handle accessible keys
		root.on('keydown', function(e) {
			var DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40;
			var DOM_VK_ESCAPE = 27, DOM_VK_ENTER = 14, DOM_VK_RETURN = 13, DOM_VK_SPACE = 32, DOM_VK_TAB = 9;
			var preventDefault;

			switch (e.keyCode) {
				case DOM_VK_LEFT:
					if (enableLeftRight) {
						if (settings.leftAction) {
							settings.leftAction();
						} else {
							moveFocus(-1);
						}

						preventDefault = true;
					}
					break;

				case DOM_VK_RIGHT:
					if (enableLeftRight) {
						if (getRole() == 'menuitem' && getParentRole() == 'menu') {
							if (getAriaProp('haspopup')) {
								action();
							}
						} else {
							moveFocus(1);
						}

						preventDefault = true;
					}
					break;

				case DOM_VK_UP:
					if (enableUpDown) {
						moveFocus(-1);
						preventDefault = true;
					}
					break;

				case DOM_VK_DOWN:
					if (enableUpDown) {
						if (getRole() == 'menuitem' && getParentRole() == 'menubar') {
							action();
						} else if (getRole() == 'button' && getAriaProp('haspopup')) {
							action();
						} else {
							moveFocus(1);
						}

						preventDefault = true;
					}
					break;

				case DOM_VK_TAB:
					preventDefault = true;

					if (e.shiftKey) {
						moveFocus(-1);
					} else {
						moveFocus(1);
					}
					break;

				case DOM_VK_ESCAPE:
					preventDefault = true;
					cancel();
					break;

				case DOM_VK_ENTER:
				case DOM_VK_RETURN:
				case DOM_VK_SPACE:
					preventDefault = action();
					break;
			}

			if (preventDefault) {
				e.stopPropagation();
				e.preventDefault();
			}
		});

		// Init on focus in
		root.on('focusin', function(e) {
			initItems();
			focussedId = e.target.id;
		});

		return {
			moveFocus: moveFocus,
			focusFirst: focusFirst,
			cancel: cancel
		};
	};
});