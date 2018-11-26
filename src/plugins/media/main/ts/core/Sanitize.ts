/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import SaxParser from 'tinymce/core/api/html/SaxParser';
import Schema from 'tinymce/core/api/html/Schema';
import Writer from 'tinymce/core/api/html/Writer';
import Settings from '../api/Settings';

const sanitize = function (editor, html) {
  if (Settings.shouldFilterHtml(editor) === false) {
    return html;
  }

  const writer = Writer();
  let blocked;

  SaxParser({
    validate: false,
    allow_conditional_comments: false,
    special: 'script,noscript',

    comment (text) {
      writer.comment(text);
    },

    cdata (text) {
      writer.cdata(text);
    },

    text (text, raw) {
      writer.text(text, raw);
    },

    start (name, attrs, empty) {
      blocked = true;

      if (name === 'script' || name === 'noscript') {
        return;
      }

      for (let i = 0; i < attrs.length; i++) {
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

    end (name) {
      if (blocked) {
        return;
      }

      writer.end(name);
    }
  }, Schema({})).parse(html);

  return writer.getContent();
};

export default {
  sanitize
};