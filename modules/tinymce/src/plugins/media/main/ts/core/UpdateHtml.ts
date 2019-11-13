/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement } from '@ephox/dom-globals';
import Writer from 'tinymce/core/api/html/Writer';
import SaxParser from 'tinymce/core/api/html/SaxParser';
import Schema from 'tinymce/core/api/html/Schema';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Size from './Size';
import { MediaData } from './Types';

const DOM = DOMUtils.DOM;

type AttrList = Array<{ name: string, value: string }> & { map: Record<string, string> };

const setAttributes = function (attrs: AttrList, updatedAttrs: Record<string, any>) {
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

const normalizeHtml = function (html: string): string {
  const writer = Writer();
  const parser = SaxParser(writer);
  parser.parse(html);
  return writer.getContent();
};

const sources = ['source', 'altsource'];

const updateHtmlSax = function (html: string, data: Partial<MediaData>, updateAll?: boolean): string {
  const writer = Writer();
  let sourceCount = 0;
  let hasImage;

  SaxParser({
    validate: false,
    allow_conditional_comments: true,

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

            if (data.altsource) {
              setAttributes(attrs, {
                src: ''
              });
            }
            break;

          case 'iframe':
            setAttributes(attrs, {
              src: data.source
            });
            break;

          case 'source':
            if (sourceCount < 2) {
              setAttributes(attrs, {
                src: data[sources[sourceCount]],
                type: data[sources[sourceCount] + 'mime']
              });

              if (!data[sources[sourceCount]]) {
                return;
              }
            }
            sourceCount++;
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
        for (let index = 0; index < 2; index++) {
          if (data[sources[index]]) {
            const attrs: any = [];
            attrs.map = {};

            if (sourceCount < index) {
              setAttributes(attrs, {
                src: data[sources[index]],
                type: data[sources[index] + 'mime']
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

const isEphoxEmbed = function (html: string): boolean {
  const fragment = DOM.createFragment(html);
  return DOM.getAttrib(fragment.firstChild, 'data-ephox-embed-iri') !== '';
};

const updateEphoxEmbed = function (html: string, data: Partial<MediaData>): string {
  const fragment = DOM.createFragment(html);
  const div = fragment.firstChild as HTMLElement;

  Size.setMaxWidth(div, data.width);
  Size.setMaxHeight(div, data.height);

  return normalizeHtml(div.outerHTML);
};

const updateHtml = function (html: string, data: Partial<MediaData>, updateAll?: boolean) {
  return isEphoxEmbed(html) ? updateEphoxEmbed(html, data) : updateHtmlSax(html, data, updateAll);
};

export default {
  updateHtml
};
