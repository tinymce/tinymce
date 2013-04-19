/**
 * I18n.js
 *
 * Copyright, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * I18n class that handles translation of TinyMCE UI.
 * Uses po style with csharp style parameters.
 *
 * @class tinymce.util.I18n
 */
define("tinymce/util/I18n", [], function() {
	"use strict";

	var data = {};

	return {
		/**
		 * Adds translations for a specific language code.
		 *
		 * @method add
		 * @param {String} code Language code like sv_SE.
		 * @param {Array} items Name/value array with English en_US to sv_SE.
		 */
		add: function(code, items) {
			for (var name in items) {
				data[name] = items[name];
			}
		},

		/**
		 * Translates the specified text.
		 *
		 * It has a few formats:
		 * I18n.translate("Text");
		 * I18n.translate(["Text {0}/{1}", 0, 1]);
		 * I18n.translate({raw: "Raw string"});
		 *
		 * @method translate
		 * @param {String/Object/Array} text Text to translate.
		 * @return {String} String that got translated.
		 */
		translate: function(text) {
			if (typeof(text) == "undefined") {
				return text;
			}

			if (typeof(text) != "string" && text.raw) {
				return text.raw;
			}

			if (text.push) {
				var values = text.slice(1);

				text = (data[text[0]] || text[0]).replace(/\{([^\}]+)\}/g, function(match1, match2) {
					return values[match2];
				});
			}

			return data[text] || text;
		},

		data: data
	};
});