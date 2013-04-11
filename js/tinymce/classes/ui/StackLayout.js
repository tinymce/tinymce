/**
 * StackLayout.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
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