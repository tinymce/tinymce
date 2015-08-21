/**
 * FlowLayout.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout manager will place the controls by using the browsers native layout.
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
			endClass: 'break'
		},

		/**
		 * Recalculates the positions of the controls in the specified container.
		 *
		 * @method recalc
		 * @param {tinymce.ui.Container} container Container instance to recalc.
		 */
		recalc: function(container) {
			container.items().filter(':visible').each(function(ctrl) {
				if (ctrl.recalc) {
					ctrl.recalc();
				}
			});
		},

		isNative: function() {
			return true;
		}
	});
});