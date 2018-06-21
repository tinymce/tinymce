/**
 * UpdateHtml.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Writer from 'tinymce/core/api/html/Writer';
import SaxParser from 'tinymce/core/api/html/SaxParser';
import Schema from 'tinymce/core/api/html/Schema';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Size from './Size';
import { Element } from '@ephox/dom-globals';

const DOM = DOMUtils.DOM;

const setAttributes = function (attrs, updatedAttrs) {
  let name;
  let i;
  let value;
  let attr;

  for (name in updatedAttrs) {
    value = '' + updatedAttrs[name];

    if (attrs.map[name]) {
      i = attrs.length;
      while (i--) {
        attr = attrs[i];

        if (attr.name === name) {
          if (value) {
            attrs.map[name] = value;
            attr.value = value;
          } else {
            delete attrs.map[name];
            attrs.splice(i, 1);
          }
        }
      }
    } else if (value) {
      attrs.push({
        name,
        value
      });

      attrs.map[name] = value;
    }
  }
};

const normalizeHtml = function (html) {
  const writer = Writer();
  const parser = SaxParser(writer);
  parser.parse(html);
  return writer.getContent();
};

const updateHtmlSax = function (html, data, updateAll?) {
  const writer = Writer();
  let sourceCount = 0;
  let hasImage;

  SaxParser({
    validate: false,
    allow_conditional_comments: true,
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
      switch (name) {
        case 'video':
        case 'object':
        case 'embed':
        case 'img':
        case 'iframe':
          if (data.height !== undefined && data.width !== undefined) {
            setAttributes(attrs, {
              width: data.width,
              height: data.height
            });
          }
          break;
      }

      if (updateAll) {
        switch (name) {
          case 'video':
            setAttributes(attrs, {
              poster: data.poster,
              src: ''
            });

            if (data.source2) {
              setAttributes(attrs, {
                src: ''
              });
            }
            break;

          case 'iframe':
            setAttributes(attrs, {
              src: data.source1
            });
            break;

          case 'source':
            sourceCount++;

            if (sourceCount <= 2) {
              setAttributes(attrs, {
                src: data['source' + sourceCount],
                type: data['source' + sourceCount + 'mime']
              });

              if (!data['source' + sourceCount]) {
                return;
              }
            }
            break;

          case 'img':
            if (!data.poster) {
              return;
            }

            hasImage = true;
            break;
        }
      }

      writer.start(name, attrs, empty);
    },

    end (name) {
      if (name === 'video' && updateAll) {
        for (let index = 1; index <= 2; index++) {
          if (data['source' + index]) {
            const attrs: any = [];
            attrs.map = {};

            if (sourceCount < index) {
              setAttributes(attrs, {
                src: data['source' + index],
                type: data['source' + index + 'mime']
              });

              writer.start('source', attrs, true);
            }
          }
        }
      }

      if (data.poster && name === 'object' && updateAll && !hasImage) {
        const imgAttrs: any = [];
        imgAttrs.map = {};

        setAttributes(imgAttrs, {
          src: data.poster,
          width: data.width,
          height: data.height
        });

        writer.start('img', imgAttrs, true);
      }

      writer.end(name);
    }
  }, Schema({})).parse(html);

  return writer.getContent();
};

const isEphoxEmbed = function (html) {
  const fragment = DOM.createFragment(html);
  return DOM.getAttrib(fragment.firstChild, 'data-ephox-embed-iri') !== '';
};

const updateEphoxEmbed = function (html, data) {
  const fragment = DOM.createFragment(html);
  const div = fragment.firstChild as Element;

  Size.setMaxWidth(div, data.width);
  Size.setMaxHeight(div, data.height);

  return normalizeHtml(div.outerHTML);
};

const updateHtml = function (html, data, updateAll?) {
  return isEphoxEmbed(html) ? updateEphoxEmbed(html, data) : updateHtmlSax(html, data, updateAll);
};

export default {
  updateHtml
};