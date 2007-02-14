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

/**
 * Returns a cleared array, since some external libraries tend to extend the Array core object
 * arrays needs to be cleaned from these extended functions. So this function simply setting any
 * named properties to null.
 *
 * @param {Array} Name/Value array to clear.
 * @return Cleared name/value array.
 * @type Array
 */
TinyMCE_Engine.prototype.clearArray = function(a) {
	var n;

	for (n in a)
		a[n] = null;

	return a;
};

/**
 * Splits a string by the specified delimiter and skips any empty items.
 *
 * @param {string} d Delimiter to split by.
 * @param {string} s String to split.
 * @return Array with chunks from string.
 * @type Array
 */
TinyMCE_Engine.prototype.explode = function(d, s) {
	var ar = s.split(d), oar = [], i;

	for (i = 0; i<ar.length; i++) {
		if (ar[i] !== '')
			oar[oar.length] = ar[i];
	}

	return oar;
};

/**#@-*/
