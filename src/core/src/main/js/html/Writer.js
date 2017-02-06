/**
 * Writer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class is used to write HTML tags out it can be used with the Serializer or the SaxParser.
 *
 * @class tinymce.html.Writer
 * @example
 * var writer = new tinymce.html.Writer({indent: true});
 * var parser = new tinymce.html.SaxParser(writer).parse('<p><br></p>');
 * console.log(writer.getContent());
 *
 * @class tinymce.html.Writer
 * @version 3.4
 */
define(
  'tinymce.core.html.Writer',
  [
    "tinymce.core.html.Entities",
    "tinymce.core.util.Tools"
  ],
  function (Entities, Tools) {
    var makeMap = Tools.makeMap;

    /**
     * Constructs a new Writer instance.
     *
     * @constructor
     * @method Writer
     * @param {Object} settings Name/value settings object.
     */
    return function (settings) {
      var html = [], indent, indentBefore, indentAfter, encode, htmlOutput;

      settings = settings || {};
      indent = settings.indent;
      indentBefore = makeMap(settings.indent_before || '');
      indentAfter = makeMap(settings.indent_after || '');
      encode = Entities.getEncodeFunc(settings.entity_encoding || 'raw', settings.entities);
      htmlOutput = settings.element_format == "html";

      return {
        /**
         * Writes the a start element such as <p id="a">.
         *
         * @method start
         * @param {String} name Name of the element.
         * @param {Array} attrs Optional attribute array or undefined if it hasn't any.
         * @param {Boolean} empty Optional empty state if the tag should end like <br />.
         */
        start: function (name, attrs, empty) {
          var i, l, attr, value;

          if (indent && indentBefore[name] && html.length > 0) {
            value = html[html.length - 1];

            if (value.length > 0 && value !== '\n') {
              html.push('\n');
            }
          }

          html.push('<', name);

          if (attrs) {
            for (i = 0, l = attrs.length; i < l; i++) {
              attr = attrs[i];
              html.push(' ', attr.name, '="', encode(attr.value, true), '"');
            }
          }

          if (!empty || htmlOutput) {
            html[html.length] = '>';
          } else {
            html[html.length] = ' />';
          }

          if (empty && indent && indentAfter[name] && html.length > 0) {
            value = html[html.length - 1];

            if (value.length > 0 && value !== '\n') {
              html.push('\n');
            }
          }
        },

        /**
         * Writes the a end element such as </p>.
         *
         * @method end
         * @param {String} name Name of the element.
         */
        end: function (name) {
          var value;

          /*if (indent && indentBefore[name] && html.length > 0) {
            value = html[html.length - 1];

            if (value.length > 0 && value !== '\n')
              html.push('\n');
          }*/

          html.push('</', name, '>');

          if (indent && indentAfter[name] && html.length > 0) {
            value = html[html.length - 1];

            if (value.length > 0 && value !== '\n') {
              html.push('\n');
            }
          }
        },

        /**
         * Writes a text node.
         *
         * @method text
         * @param {String} text String to write out.
         * @param {Boolean} raw Optional raw state if true the contents wont get encoded.
         */
        text: function (text, raw) {
          if (text.length > 0) {
            html[html.length] = raw ? text : encode(text);
          }
        },

        /**
         * Writes a cdata node such as <![CDATA[data]]>.
         *
         * @method cdata
         * @param {String} text String to write out inside the cdata.
         */
        cdata: function (text) {
          html.push('<![CDATA[', text, ']]>');
        },

        /**
         * Writes a comment node such as <!-- Comment -->.
         *
         * @method cdata
         * @param {String} text String to write out inside the comment.
         */
        comment: function (text) {
          html.push('<!--', text, '-->');
        },

        /**
         * Writes a PI node such as <?xml attr="value" ?>.
         *
         * @method pi
         * @param {String} name Name of the pi.
         * @param {String} text String to write out inside the pi.
         */
        pi: function (name, text) {
          if (text) {
            html.push('<?', name, ' ', encode(text), '?>');
          } else {
            html.push('<?', name, '?>');
          }

          if (indent) {
            html.push('\n');
          }
        },

        /**
         * Writes a doctype node such as <!DOCTYPE data>.
         *
         * @method doctype
         * @param {String} text String to write out inside the doctype.
         */
        doctype: function (text) {
          html.push('<!DOCTYPE', text, '>', indent ? '\n' : '');
        },

        /**
         * Resets the internal buffer if one wants to reuse the writer.
         *
         * @method reset
         */
        reset: function () {
          html.length = 0;
        },

        /**
         * Returns the contents that got serialized.
         *
         * @method getContent
         * @return {String} HTML contents that got written down.
         */
        getContent: function () {
          return html.join('').replace(/\n$/, '');
        }
      };
    };
  }
);