/**
 * ToolbarGroup.js
 *
 * Copyright 2010, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

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
	
	focus: function() {
		this.controls[0].focus();
	}
});
