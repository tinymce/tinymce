/**
 * $Id$
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

/**#@+
 * @member TinyMCE_Engine
 * @method
 */
tinyMCE.add(TinyMCE_Engine, {
	/**
	 * Debugs the specified message to devkit if it's loaded.
	 *
	 * @param {1..n} Numerous arguments that will be outputed.
	 */
	debug : function() {
		var m = "", a, i, l = tinyMCE.log.length;

		for (i=0, a = this.debug.arguments; i<a.length; i++) {
			m += a[i];

			if (i<a.length-1)
				m += ', ';
		}

		if (l < 1000)
			tinyMCE.log[l] = "[debug] " + m;
	}

	/**#@-*/
});

