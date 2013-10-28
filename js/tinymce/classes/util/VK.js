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
        
	function ctrlKeyPressed(e, editor) {
		if (Env.mac) {
			if (editor) {
				switch (editor.settings.mac_ctrl_key) {
				case 'ctrl': return e.ctrlKey;
				case 'cmd':  return e.metaKey;
				}
			}
			return e.ctrlKey || e.metaKey;
		}
		return e.ctrlKey;
	}

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

		// Sensitive to the mac_ctrl_key preference
		ctrlKeyPressed: ctrlKeyPressed,

		// This name is misleading, but it is used in
		// Quirks.js to detect when Cmd-A/Ctrl-A behavior
		// should be modified.
		metaKeyPressed: function(e, editor) {
			// Check if ctrl or meta key is pressed also check if alt is false for Polish users
			return ctrlKeyPressed(e, editor) && !e.altKey;
		}
	};
});
