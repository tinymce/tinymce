/**
 * $Id: TinyMCE_Array.class.js 4 2006-06-05 19:41:56Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2006, Moxiecode Systems AB, All rights reserved.
 *
 * The contents of this file will be wrapped in a class later on.
 */

/**
 * Returns a cleared array, since some external libraries tend to extend the Array core object
 * arrays needs to be cleaned from these extended functions. So this function simply sets any
 * named properties back to null.
 *
 * @param {Array} Name/Value array to clear.
 * @return Cleared name/value array.
 * @type Array
 */
TinyMCE_Engine.prototype.clearArray = function(a) {
	for (var k in a)
		a[k] = null;

	return a;
};
