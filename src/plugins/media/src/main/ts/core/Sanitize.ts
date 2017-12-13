/**
 * Sanitize.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import SaxParser from 'tinymce/core/html/SaxParser';
import Schema from 'tinymce/core/html/Schema';
import Writer from 'tinymce/core/html/Writer';
import Tools from 'tinymce/core/util/Tools';
import Settings from '../api/Settings';

var sanitize = function (editor, html) {
  if (Settings.shouldFilterHtml(editor) === false) {
    return html;
  }

  var writer = new Writer();
  var blocked;

  new SaxParser({
    validate: false,
    allow_conditional_comments: false,
    special: 'script,noscript',

    comment: function (text) {
      writer.comment(text);
    },

    cdata: function (text) {
      writer.cdata(text);
    },

    text: function (text, raw) {
      writer.text(text, raw);
    },

    start: function (name, attrs, empty) {
      blocked = true;

      if (name === 'script' || name === 'noscript') {
        return;
      }

      for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.indexOf('on') === 0) {
          return;
        }

        if (attrs[i].name === 'style') {
          attrs[i].value = editor.dom.serializeStyle(editor.dom.parseStyle(attrs[i].value), name);
        }
      }

      writer.start(name, attrs, empty);
      blocked = false;
    },

    end: function (name) {
      if (blocked) {
        return;
      }

      writer.end(name);
    }
  }, new Schema({})).parse(html);

  return writer.getContent();
};

export default <any> {
  sanitize: sanitize
};