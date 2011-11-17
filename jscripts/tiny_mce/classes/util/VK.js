/**
 * This file exposes a set of the common KeyCodes for use.  Please grow it as needed.
 */

(function(tinymce){
	tinymce.VK = {
		DELETE: 46,
		BACKSPACE: 8,
		ENTER: 13,
		TAB: 9,
        SPACEBAR: 32,
		UP: 38,
		DOWN: 40,
		modifierPressed: function (e) {
			return e.shiftKey || e.ctrlKey || e.altKey;
		}
	}
})(tinymce);
