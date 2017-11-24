/**
 * TrimHtml.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.dom.TrimHtml',
  [
    'tinymce.core.html.SaxParser',
    'tinymce.core.text.Zwsp'
  ],
  function (SaxParser, Zwsp) {
    var trimHtml = function (tempAttrs, html) {
      var trimContentRegExp = new RegExp([
        '\\s?(' + tempAttrs.join('|') + ')="[^"]+"' // Trim temporaty data-mce prefixed attributes like data-mce-selected
      ].join('|'), 'gi');

      return html.replace(trimContentRegExp, '');
    };

    var trimInternal = function (serializer, html) {
      var content = html;
      var bogusAllRegExp = /<(\w+) [^>]*data-mce-bogus="all"[^>]*>/g;
      var endTagIndex, index, matchLength, matches, shortEndedElements;
      var schema = serializer.schema;

      content = trimHtml(serializer.getTempAttrs(), content);
      shortEndedElements = schema.getShortEndedElements();

      // Remove all bogus elements marked with "all"
      while ((matches = bogusAllRegExp.exec(content))) {
        index = bogusAllRegExp.lastIndex;
        matchLength = matches[0].length;

        if (shortEndedElements[matches[1]]) {
          endTagIndex = index;
        } else {
          endTagIndex = SaxParser.findEndTag(schema, content, index);
        }

        content = content.substring(0, index - matchLength) + content.substring(endTagIndex);
        bogusAllRegExp.lastIndex = index - matchLength;
      }

      return content;
    };

    var trimExternal = function (serializer, html) {
      return Zwsp.trim(trimInternal(serializer, html));
    };

    return {
      trimExternal: trimExternal,
      trimInternal: trimInternal
    };
  }
);
