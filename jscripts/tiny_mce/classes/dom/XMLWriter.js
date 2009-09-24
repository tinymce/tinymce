/**
 * XMLWriter.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

(function(tinymce) {
	/**
	 * This class writes nodes into a XML document structure. This structure can then be
	 * serialized down to a HTML string later on.
	 * @class tinymce.dom.XMLWriter
	 */
	tinymce.create('tinymce.dom.XMLWriter', {
		node : null,

		/**
		 * Constructs a new XMLWriter.
		 *
		 * @constructor
		 * @method XMLWriter
		 * @param {Object} s Optional settings object.
		 */
		XMLWriter : function(s) {
			// Get XML document
			function getXML() {
				var i = document.implementation;

				if (!i || !i.createDocument) {
					// Try IE objects
					try {return new ActiveXObject('MSXML2.DOMDocument');} catch (ex) {}
					try {return new ActiveXObject('Microsoft.XmlDom');} catch (ex) {}
				} else
					return i.createDocument('', '', null);
			};

			this.doc = getXML();
			
			// Since Opera and WebKit doesn't escape > into &gt; we need to do it our self to normalize the output for all browsers
			this.valid = tinymce.isOpera || tinymce.isWebKit;

			this.reset();
		},

		/**
		 * Resets the writer so it can be reused the contents of the writer is cleared.
		 *
		 * @method reset
		 */
		reset : function() {
			var t = this, d = t.doc;

			if (d.firstChild)
				d.removeChild(d.firstChild);

			t.node = d.appendChild(d.createElement("html"));
		},

		/**
		 * Writes the start of an element like for example: <tag.
		 *
		 * @method writeStartElement
		 * @param {String} n Name of element to write.
		 */
		writeStartElement : function(n) {
			var t = this;

			t.node = t.node.appendChild(t.doc.createElement(n));
		},

		/**
		 * Writes an attrubute like for example: myattr="valie"
		 *
		 * @method writeAttribute
		 * @param {String} n Attribute name to write.
		 * @param {String} v Attribute value to write.
		 */
		writeAttribute : function(n, v) {
			if (this.valid)
				v = v.replace(/>/g, '%MCGT%');

			this.node.setAttribute(n, v);
		},

		/**
		 * Write the end of a element. This will add a short end for elements with out children like for example a img element.
		 *
		 * @method writeEndElement
		 */
		writeEndElement : function() {
			this.node = this.node.parentNode;
		},

		/**
		 * Writes the end of a element. This will add a full end to the element even if it didn't have any children.
		 *
		 * @method writeFullEndElement
		 */
		writeFullEndElement : function() {
			var t = this, n = t.node;

			n.appendChild(t.doc.createTextNode(""));
			t.node = n.parentNode;
		},

		/**
		 * Writes a text node value.
		 *
		 * @method writeText
		 * @param {String} v Value to append as a text node.
		 */
		writeText : function(v) {
			if (this.valid)
				v = v.replace(/>/g, '%MCGT%');

			this.node.appendChild(this.doc.createTextNode(v));
		},

		/**
		 * Writes a CDATA section.
		 *
		 * @method writeCDATA
		 * @param {String} v Value to write in CDATA.
		 */
		writeCDATA : function(v) {
			this.node.appendChild(this.doc.createCDATASection(v));
		},

		/**
		 * Writes a comment.
		 *
		 * @method writeComment
		 * @param {String} v Value of the comment.
		 */
		writeComment : function(v) {
			// Fix for bug #2035694
			if (tinymce.isIE)
				v = v.replace(/^\-|\-$/g, ' ');

			this.node.appendChild(this.doc.createComment(v.replace(/\-\-/g, ' ')));
		},

		/**
		 * Returns a string representation of the elements/nodes written.
		 *
		 * @method getContent
		 * @return {String} String representation of the written elements/nodes.
		 */
		getContent : function() {
			var h;

			h = this.doc.xml || new XMLSerializer().serializeToString(this.doc);
			h = h.replace(/<\?[^?]+\?>|<html>|<\/html>|<html\/>|<!DOCTYPE[^>]+>/g, '');
			h = h.replace(/ ?\/>/g, ' />');

			if (this.valid)
				h = h.replace(/\%MCGT%/g, '&gt;');

			return h;
		}
	});
})(tinymce);
