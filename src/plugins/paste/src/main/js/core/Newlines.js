/**
 * Newlines.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Newlines class contains utilities to convert newlines (\n or \r\n) tp BRs or to a combination of the specified block element and BRs
 *
 * @class tinymce.Newlines
 * @private
 */
define(
  'tinymce.plugins.paste.core.Newlines',
  [],
  function () {

    var encodeEntities = function (text) {
      // from: tinymce.core.html.Entities
      var baseEntities = {
        '\"': '&quot;', // Needs to be escaped since the YUI compressor would otherwise break the code
        "'": '&#39;',
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '\u0060': '&#96;'
      };

      return text.replace(/[<>&\"\']/g, function ($0) {
        return baseEntities[$0] || $0;
      });
    };


    var isPlainText = function (text) {
      // so basically any tag that is not one of the "p, div, br", or is one of them, but is followed
      // by some additional characters qualifies the text as not a plain text (having some HTML tags)
      return !/<(?:(?!\/?(?:div|p|br))[^>]*|(?:div|p|br)\s+\w[^>]+)>/.test(text);
    };


    var toBRs = function (text) {
      return text.replace(/\r?\n/g, '<br>');
    };


    var openContainer = function (rootTag, rootAttrs) {
      var key, attrs = [];
      var tag = '<' + rootTag;

      if (typeof rootAttrs === 'object') {
        for (key in rootAttrs) {
          if (rootAttrs.hasOwnProperty(key)) {
            attrs.push(key + '="' + encodeEntities(rootAttrs[key]) + '"');
          }
        }

        if (attrs.length) {
          tag += ' ' + attrs.join(' ');
        }
      }
      return tag + '>';
    };


    var toBlockElements = function (html, rootTag, rootAttrs) {
      var pieces = html.split(/\r?\n/);
      var i = 0, len = pieces.length;
      var result = '';
      var stack = [];
      var isLast, newlineFollows, isSingleNewline;

      for (; i < len; i++) {
        isLast = i === len - 1;
        newlineFollows = !isLast && !pieces[i + 1];
        isSingleNewline = !pieces[i] && !stack.length;

        stack.push(pieces[i] ? pieces[i] : '&nbsp;');

        if (isLast || newlineFollows || isSingleNewline) {
          result += openContainer(rootTag, rootAttrs) + stack.join('<br>') + '</' + rootTag + '>';
          stack = [];
        }

        if (newlineFollows) {
          i++; // extra progress for extra newline
        }
      }

      return result;
    };


    var convert = function (text, rootTag, rootAttrs) {
      return rootTag ? toBlockElements(text, rootTag, rootAttrs) : toBRs(text);
    };


    return {
      isPlainText: isPlainText,
      convert: convert,
      toBRs: toBRs,
      toBlockElements: toBlockElements
    };
  }
);