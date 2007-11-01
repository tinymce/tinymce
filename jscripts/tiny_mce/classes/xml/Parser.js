/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.xml.Parser', {
		Parser : function(s) {
			this.settings = tinymce.extend({
				async : true
			}, s);
		},

		load : function(u, cb, s) {
			var doc, t, w = window;

			s = s || this;

			// Explorer, use XMLDOM since it can be used on local fs
			if (window.ActiveXObject) {
				doc = new ActiveXObject("Microsoft.XMLDOM");
				doc.async = this.settings.async;

				// Wait for response
				if (doc.async) {
					t = w.setInterval(function() {
						if (doc.readyState == 4 || c++ > 10000) {
							w.clearInterval(t);
							cb.call(s, doc);
						}
					}, 10);
				}

				doc.load(u);

				if (!doc.async)
					cb.call(s, doc);

				return;
			}

			// W3C using XMLHttpRequest
			if (window.XMLHttpRequest) {
				doc = new window.XMLHttpRequest();
				doc.open('GET', u, this.settings.async);
				doc.async = this.settings.async;

				doc.onload = function() {
					cb.call(s, doc.responseXML);
				};

				doc.send('');
			}
		},

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
					if (el.nodeType == 3)
						o += el.nodeValue;
				} while(el = el.nextSibling);
			}

			return o;
		}
	});
})();
