/**
 * ToolbarGroup.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
// Shorten class names
var dom = tinymce.DOM, each = tinymce.each;
/**
 * This class is used to group a set of toolbars together and control the keyboard navigation and focus.
 *
 * @class tinymce.ui.ToolbarGroup
 * @extends tinymce.ui.Container
 */
tinymce.create('tinymce.ui.ToolbarGroup:tinymce.ui.Container', {
	/**
	 * Renders the toolbar group as a HTML string.
	 *
	 * @method renderHTML
	 * @return {String} HTML for the toolbar control.
	 */
	renderHTML : function() {
		var t = this, h = [], controls = t.controls, each = tinymce.each, settings = t.settings;
		h.push('<div id="' + t.id + '" role="group" aria-label="' + settings.name + '">');
		each(controls, function(toolbar) {
			h.push(toolbar.renderHTML());
		});
		h.push('</div>');
		return h.join('');
	},
	
	focus : function() {
		dom.get(dom.getAttrib(this.id, 'aria-activedescendant')).focus();
	},
	
	postRender : function() {
		var t = this, groupElement = dom.get(t.id);
		dom.bind(groupElement, 'keydown', t.keydown, t);
		dom.setAttrib(t.controls[0].controls[0].id, 'tabindex', 0);
		dom.setAttrib(groupElement, 'aria-activedescendant', t.controls[0].controls[0].id);
		each(t.controls, function(toolbar) {
			each(toolbar.controls, function(control) {
				dom.bind(control.id, 'focus', function() {
					dom.setAttrib(groupElement, 'aria-activedescendant', control.id);
				});
			});
		});
	},
	
	keydown : function(evt) {
		var t = this, DOM_VK_LEFT = 37, DOM_VK_RIGHT = 39, DOM_VK_UP = 38, DOM_VK_DOWN = 40, DOM_VK_ESCAPE = 27, controls = t.controls, focussedId = dom.getAttrib(t.id, 'aria-activedescendant'), idx, toolbarIdx, newFocus;
		// TODO: May need to reverse direction in RTL languages.
		function moveFocus(dir, toolbarDir) {
			if (!focussedId) return;
			
			function nextToolbar(dir) {
				toolbarIdx += dir;
				if (toolbarIdx < 0) {
					toolbarIdx = controls.length - 1;
				} else if (toolbarIdx >= controls.length) {
					toolbarIdx = 0;
				}
			}
			
			each(t.controls, function(toolbar, toolbarIndex) {
				each(toolbar.controls, function(control, itemIndex) {
					if (focussedId === control.id) {
						idx = itemIndex;
						toolbarIdx = toolbarIndex;
						return false;
					}
				});
			});
			
			if (toolbarDir) {
				nextToolbar(toolbarDir);
				idx = Math.min(idx, controls[toolbarIdx].controls.length - 1);
				newFocus = controls[toolbarIdx].controls[idx];
			}

			while (!newFocus || !newFocus.id) {
				idx += dir;
				if (idx < 0) {
					nextToolbar(-1);
					idx = controls[toolbarIdx].controls.length - 1;
				} else if (idx >= controls[toolbarIdx].controls.length) {
					nextToolbar(1);
					idx = 0;
				}
				newFocus = controls[toolbarIdx].controls[idx];
				// Avoid going into an infinite loop if we get back to where we started and still don't have anything to focus.
				if (newFocus.id === focussedId) break;
			}

			dom.setAttrib(focussedId, 'tabindex', '-1');
			dom.setAttrib(t.id, 'aria-activedescendant', newFocus.id);
			dom.setAttrib(newFocus.id, 'tabindex', '0');
			dom.get(newFocus.id).focus();
			tinymce.dom.Event.cancel(evt);
		}
		
		switch (evt.keyCode) {
			case DOM_VK_LEFT:
				moveFocus(-1);
				break;
			case DOM_VK_RIGHT:
				moveFocus(1);
				break;
			case DOM_VK_UP:
				moveFocus(1, -1);
				break;
			case DOM_VK_DOWN:
				moveFocus(1, 1);
				break;
			case DOM_VK_ESCAPE:
				t.editor.focus();
				break;
		}
	}
});
})(tinymce);
