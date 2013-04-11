/**
 * MenuBar.js
 *
 * Copyright 2003-2012, Moxiecode Systems AB, All rights reserved.
 */

/**
 * ..
 *
 * @-x-less MenuBar.less
 * @class tinymce.ui.MenuBar
 * @extends tinymce.ui.Container
 */
define("tinymce/ui/MenuBar", [
	"tinymce/ui/Toolbar"
], function(Toolbar) {
	"use strict";

	return Toolbar.extend({
		Defaults: {
			role: 'menubar',
			containerCls: 'menubar',
			defaults: {
				type: 'menubutton'
			}
		}
	});
});