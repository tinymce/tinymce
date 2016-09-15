/**
 * I18n.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
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

	var data = {}, code = "en";

	return {
		/**
		 * Sets the current language code.
		 *
		 * @method setCode
		 * @param {String} newCode Current language code.
		 */
		setCode: function(newCode) {
			if (newCode) {
				code = newCode;
				this.rtl = this.data[newCode] ? this.data[newCode]._dir === 'rtl' : false;
			}
		},

		/**
		 * Returns the current language code.
		 *
		 * @method getCode
		 * @return {String} Current language code.
		 */
		getCode: function() {
			return code;
		},

		/**
		 * Property gets set to true if a RTL language pack was loaded.
		 *
		 * @property rtl
		 * @type Boolean
		 */
		rtl: false,

		/**
		 * Adds translations for a specific language code.
		 *
		 * @method add
		 * @param {String} code Language code like sv_SE.
		 * @param {Array} items Name/value array with English en_US to sv_SE.
		 */
		add: function(code, items) {
			var langData = data[code];

			if (!langData) {
				data[code] = langData = {};
			}

			for (var name in items) {
				langData[name] = items[name];
			}

			this.setCode(code);
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
			if (typeof text == "undefined") {
				return text;
			}

			if (typeof text != "string" && text.raw) {
				return text.raw;
			}

			/**
			 * Get the translation of key in the current language/variant. If a variant is active and the key is not
			 * found there, also tries the root language, e.g. if 'I am a text' is not found in "fr_FR", also looks for
			 * it in "fr".
			 * @param {String} the text to be translated
			 * @return {String} the translation, for further processing, or undefined if no translation was found.
			 */
			function getTranslated(key) {
				var langData = data[code];
				if (!langData) {
					langData = {};
				}

				if (langData[key] || code.indexOf('_') == -1) {
					// Match found, or not using a language variant
					return langData[key];
				}

				// No match found, and using a language variant
				langData = data[code.substr(0, code.indexOf('_'))];

				return langData ? langData[key] : undefined;
			}

			if (text.push) {
				var values = text.slice(1);

				text = (getTranslated(text[0]) || text[0]).replace(/\{([0-9]+)\}/g, function(match1, match2) {
					return values[match2];
				});
			}

			return (getTranslated(text) || text).replace(/{context:\w+}$/, '');
		},

		data: data
	};
});