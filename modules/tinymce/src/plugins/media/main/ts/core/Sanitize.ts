/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import SaxParser from 'tinymce/core/api/html/SaxParser';
import Schema from 'tinymce/core/api/html/Schema';
import Writer from 'tinymce/core/api/html/Writer';
import * as Settings from '../api/Settings';

const sanitize = function (editor: Editor, html: string) {
  if (Settings.shouldFilterHtml(editor) === false) {
    return html;
  }

  const writer = Writer();
  let blocked;

  SaxParser({
    validate: false,
    allow_conditional_comments: false,

    comment(text) {
      writer.comment(text);
    },

    cdata(text) {
      writer.cdata(text);
    },

    text(text, raw) {
      writer.text(text, raw);
    },

    start(name, attrs, empty) {
      blocked = true;

      if (name === 'script' || name === 'noscript' || name === 'svg') {
        return;
      }

      for (let i = attrs.length - 1; i >= 0; i--) {
        const attrName = attrs[i].name;

        if (attrName.indexOf('on') === 0) {
          delete attrs.map[attrName];
          attrs.splice(i, 1);
        }

        if (attrName === 'style') {
          attrs[i].value = editor.dom.serializeStyle(editor.dom.parseStyle(attrs[i].value), name);
        }
      }

      writer.start(name, attrs, empty);
      blocked = false;
    },

    end(name) {
      if (blocked) {
        return;
      }

      writer.end(name);
    }
  }, Schema({})).parse(html);

  return writer.getContent();
};

export {
  sanitize
};
