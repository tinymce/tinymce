/**
 * $Id: TinyMCE_Compatibility.class.js 5 2006-06-05 19:51:22Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 */

/**
 * I'm going agains my own rule here by patching in the call method for objects.
 * But since this is absolutly vital for OOP JavaScript and that it checks if it exists before
 * patching it's not the same as paching in new functions that might break future versions
 * of JavaScript like some common libraries out there do.
 */
if (!Function.prototype.call) {
	Function.prototype.call = function() {
		var a = arguments, s = a[0], i, as = '', r, o;

		for (i=1; i<a.length; i++)
			as += (i > 1 ? ',' : '') + 'a[' + i + ']';

		o = s._fu;
		s._fu = this;
		r = eval('s._fu(' + as + ')');
		s._fu = o;

		return r;
	};
};
