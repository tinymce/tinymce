/**
 * FlowLayout.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less FlowLayout.less
 * @class tinymce.ui.FlowLayout
 * @extends tinymce.ui.Layout
 */
define("tinymce/ui/FlowLayout", [
	"tinymce/ui/Layout"
], function(Layout) {
	return Layout.extend({
		Defaults: {
			containerClass: 'flow-layout',
			controlClass: 'flow-layout-item',
			endClass : 'break'
		},

		recalc: function(container) {
			container.items().filter(':visible').each(function(ctrl) {
				if (ctrl.recalc) {
					ctrl.recalc();
				}
			});
		}
	});
});