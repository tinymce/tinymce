/**
 * StackLayout.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This layout uses the browsers layout when the items are blocks.
 *
 * @-x-less StackLayout.less
 * @class tinymce.ui.StackLayout
 * @extends tinymce.ui.FlowLayout
 */
define("tinymce/ui/StackLayout", [
	"tinymce/ui/FlowLayout"
], function(FlowLayout) {
	"use strict";

	return FlowLayout.extend({
		Defaults: {
			containerClass: 'stack-layout',
			controlClass: 'stack-layout-item',
			endClass : 'break'
		}
	});
});