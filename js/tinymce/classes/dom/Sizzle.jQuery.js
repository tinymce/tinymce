/**
 * Sizzle.jQuery.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global jQuery:true */

/*
 * Fake Sizzle using jQuery.
 */
define("tinymce/dom/Sizzle", [], function() {
	var $ = jQuery;

	function Sizzle(selector, context, results, seed) {
		return $.find(selector, context, results, seed);
	}

	Sizzle.matches = function(expr, elements) {
		return $(elements).is(expr) ? elements : [];
	};

	return Sizzle;
});
