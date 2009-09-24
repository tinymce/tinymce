/**
 * Parser.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function() {
	/**
	 * XML Parser class. This class is only available for the dev version of TinyMCE.
	 */
	tinymce.create('tinymce.xml.Parser', {
		/**
		 * Constucts a new XML parser instance.
		 *
		 * @param {Object} Optional settings object.
		 */
		Parser : function(s) {
			this.settings = tinymce.extend({
				async : true
			}, s);
		},

		/**
		 * Parses the specified document and executed the callback ones it's parsed.
		 *
		 * @param {String} u URL to XML file to parse.
		 * @param {function} cb Optional callback to execute ones the XML file is loaded.
		 * @param {Object} s Optional scope for the callback execution.
		 */
		load : function(u, cb, s) {
			var doc, t, w = window, c = 0;

			s = s || this;

			// Explorer, use XMLDOM since it can be used on local fs
			if (window.ActiveXObject) {
				doc = new ActiveXObject("Microsoft.XMLDOM");
				doc.async = this.settings.async;

				// Wait for response
				if (doc.async) {
					function check() {
						if (doc.readyState == 4 || c++ > 10000)
							return cb.call(s, doc);

						w.setTimeout(check, 10);
					};

					t = w.setTimeout(check, 10);
				}

				doc.load(u);

				if (!doc.async)
					cb.call(s, doc);

				return;
			}

			// W3C using XMLHttpRequest
			if (window.XMLHttpRequest) {
				try {
					doc = new window.XMLHttpRequest();
					doc.open('GET', u, this.settings.async);
					doc.async = this.settings.async;

					doc.onload = function() {
						cb.call(s, doc.responseXML);
					};

					doc.send('');
				} catch (ex) {
					cb.call(s, null, ex);
				}
			}
		},

		/**
		 * Parses the specified XML string.
		 *
		 * @param {String} xml XML String to parse.
		 * @return {Document} XML Document instance.
		 */
		loadXML : function(xml) {
			var doc;

			// W3C
			if (window.DOMParser)
				return new DOMParser().parseFromString(xml, "text/xml");

			// Explorer
			if (window.ActiveXObject) {
				doc = new ActiveXObject("Microsoft.XMLDOM");
				doc.async = "false";
				doc.loadXML(xml);

				return doc;
			}
		},

		/**
		 * Returns all string contents of a element concated together.
		 *
		 * @param {XMLNode} el XML element to retrive text from.
		 * @return {string} XML element text contents.
		 */
		getText : function(el) {
			var o = '';

			if (!el)
				return '';

			if (el.hasChildNodes()) {
				el = el.firstChild;

				do {
					if (el.nodeType == 3 || el.nodeType == 4)
						o += el.nodeValue;
				} while(el = el.nextSibling);
			}

			return o;
		}
	});
})();
