/**
 * VK.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This file exposes a set of the common KeyCodes for use.  Please grow it as needed.
 */
define("tinymce/util/VK", [
	"tinymce/Env"
], function(Env) {
	return {
		BACKSPACE: 8,
		DELETE: 46,
		DOWN: 40,
		ENTER: 13,
		LEFT: 37,
		RIGHT: 39,
		SPACEBAR: 32,
		TAB: 9,
		UP: 38,

		modifierPressed: function(e) {
			return e.shiftKey || e.ctrlKey || e.altKey;
		},

		metaKeyPressed: function(e) {
			// Check if ctrl or meta key is pressed. Edge case for AltGr on Windows where it produces ctrlKey+altKey states
			return (Env.mac ? e.metaKey : e.ctrlKey && !e.altKey);
		}
	};
});
