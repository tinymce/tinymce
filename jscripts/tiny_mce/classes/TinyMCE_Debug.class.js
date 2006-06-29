/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

/**
 * Debugs the specified message to a screen.
 *
 * @param {1..n} Numerous arguments that will be outputed.
 */
TinyMCE_Engine.prototype.debug = function() {
	var m = "", e, a, i;

	e = document.getElementById("tinymce_debug");
	if (!e) {
		var d = document.createElement("div");
		d.setAttribute("className", "debugger");
		d.className = "debugger";
		d.innerHTML = 'Debug output:<textarea id="tinymce_debug" style="width: 100%; height: 300px" wrap="nowrap" mce_editable="false"></textarea>';

		document.body.appendChild(d);
		e = document.getElementById("tinymce_debug");
	}

	a = this.debug.arguments;
	for (i=0; i<a.length; i++) {
		m += a[i];
		if (i<a.length-1)
			m += ', ';
	}

	e.value += m + "\n";
};
