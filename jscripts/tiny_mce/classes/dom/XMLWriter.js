/**
 * $Id: tiny_mce_dev.js 229 2007-02-27 13:00:23Z spocke $
 *
 * @author Moxiecode
 * @copyright Copyright © 2004-2007, Moxiecode Systems AB, All rights reserved.
 */

(function() {
	tinymce.create('tinymce.dom.XMLWriter', {
		node : null,

		XMLWriter : function(s) {
			// Get XML document
			function getXML() {
				var i = document.implementation;

				if (!i || !i.createDocument) {
					// Try IE objects
					try {return new ActiveXObject('MSXML2.DOMDocument');} catch (ex1) {}
					try {return new ActiveXObject('Microsoft.XmlDom');} catch (ex2) {}
				} else
					return i.createDocument('', '', null);
			};

			this.doc = getXML();
			this.reset();
		},

		reset : function() {
			var t = this, d = t.doc;

			if (d.firstChild)
				d.removeChild(d.firstChild);

			t.node = d.appendChild(d.createElement("html"));
		},

		writeStartElement : function(n) {
			var t = this;

			t.node = t.node.appendChild(t.doc.createElement(n));
		},

		writeAttribute : function(n, v) {
			// Since Opera doesn't escape > into &gt; we need to do it our self
			if (tinymce.isOpera)
				v = v.replace(/>/g, '|>');

			this.node.setAttribute(n, v);
		},

		writeEndElement : function() {
			this.node = this.node.parentNode;
		},

		writeFullEndElement : function() {
			var t = this, n = t.node;

			n.appendChild(t.doc.createTextNode(""));
			t.node = n.parentNode;
		},

		writeText : function(v) {
			// Since Opera doesn't escape > into &gt; we need to do it our self
			if (tinymce.isOpera)
				v = v.replace(/>/g, '|>');

			this.node.appendChild(this.doc.createTextNode(v));
		},

		writeCDATA : function(v) {
			this.node.appendChild(this.doc.createCDATA(v));
		},

		writeComment : function(v) {
			this.node.appendChild(this.doc.createComment(v));
		},

		getContent : function() {
			var h;

			h = this.doc.xml || new XMLSerializer().serializeToString(this.doc);
			h = h.replace(/<\?[^?]+\?>|<html>|<\/html>/g, '');
			h = h.replace(/ ?\/>/g, ' />');

			// Since Opera doesn't escape > into &gt; we need to do it our self
			if (tinymce.isOpera)
				h = h.replace(/\|>/g, '&gt;');

			return h;
		}
	});
})();
