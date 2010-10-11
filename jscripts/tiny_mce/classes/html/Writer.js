/**
 * Writer.js
 *
 * Copyright 2009, Moxiecode Systems AB
 * Released under LGPL License.
 *
 * License: http://tinymce.moxiecode.com/license
 * Contributing: http://tinymce.moxiecode.com/contributing
 */

tinymce.html.Writer = function(settings) {
	var html = [], indent, indentBefore, indentAfter, encode;

	settings = settings || {};
	indent = settings.indent;
	indentBefore = tinymce.makeMap(settings.indent_before || '');
	indentAfter = tinymce.makeMap(settings.indent_after || '');

	if (!settings.entity_encoding) {
		encode = function(str) {
			return str;
		};
	} else
		encode = tinymce.html.Entities.getEncodeFunc(settings.entity_encoding, settings.entities);

	return {
		start: function(name, attrs, empty) {
			var i, l, attr, value;

			if (indent && indentBefore[name] && html.length > 0) {
				value = html[html.length - 1];

				if (value.length > 0 && value !== '\n')
					html.push('\n');
			}

			html.push('<', name);

			for (i = 0, l = attrs.length; i < l; i++) {
				attr = attrs[i];
				html.push(' ', attr.name, '="', encode(attr.value), '"');
			}

			if (!empty) {
				html[html.length] = '>';
			} else
				html[html.length] = ' />';

			/*if (indent && indentAfter[name])
				html.push('\n');*/
		},

		end: function(name) {
			var value;

			/*if (indent && indentBefore[name] && html.length > 0) {
				value = html[html.length - 1];

				if (value.length > 0 && value !== '\n')
					html.push('\n');
			}*/

			html.push('</', name, '>');

			if (indent && indentAfter[name] && html.length > 0) {
				value = html[html.length - 1];

				if (value.length > 0 && value !== '\n')
					html.push('\n');
			}
		},

		text: function(text, raw) {
			if (text.length > 0)
				html[html.length] = raw ? text : encode(text);
		},

		cdata: function(text) {
			html.push('<![CDATA[', text, ']]>');
		},

		comment: function(text) {
			html.push('<!--', text, '-->');
		},

		pi: function(text) {
			html.push('<?xml', text, '?>');
		},

		doctype: function(text) {
			html.push('<!DOCTYPE', text, '>');
		},

		reset: function() {
			html.length = 0;
		},

		getContent: function() {
			return html.join('').replace(/\n$/, '');
		}
	};
};
