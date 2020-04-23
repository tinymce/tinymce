/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Obj } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import SaxParser from 'tinymce/core/api/html/SaxParser';
import Schema from 'tinymce/core/api/html/Schema';
import Writer from 'tinymce/core/api/html/Writer';
import { MediaData } from './Types';

type AttrList = Array<{ name: string; value: string }> & { map: Record<string, string> };

const DOM = DOMUtils.DOM;

const addPx = (value: string) => /^[0-9.]+$/.test(value) ? (value + 'px') : value;

const setAttributes = (attrs: AttrList, updatedAttrs: Record<string, any>) => {
  Obj.each(updatedAttrs, (val, name) => {
    const value = '' + val;

    if (attrs.map[name]) {
      let i = attrs.length;
      while (i--) {
        const attr = attrs[i];

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
  });
};

const updateEphoxEmbed = (data: Partial<MediaData>, attrs: AttrList) => {
  const style = attrs.map.style;
  const styleMap = style ? DOM.parseStyle(style) : { };
  styleMap['max-width'] = addPx(data.width);
  styleMap['max-height'] = addPx(data.height);
  setAttributes(attrs, {
    style: DOM.serializeStyle(styleMap)
  });
};

const sources = [ 'source', 'altsource' ];

const updateHtml = (html: string, data: Partial<MediaData>, updateAll?: boolean): string => {
  const writer = Writer();
  const isEphoxEmbed = Cell<boolean>(false);
  let sourceCount = 0;
  let hasImage;

  SaxParser({
    validate: false,
    allow_conditional_comments: true,

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
      if (isEphoxEmbed.get()) {
        // Don't make any changes to children of an EME embed
      } else if (Obj.has(attrs.map, 'data-ephox-embed-iri')) {
        isEphoxEmbed.set(true);
        updateEphoxEmbed(data, attrs);
      } else {
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
      }

      writer.start(name, attrs, empty);
    },

    end(name) {
      if (!isEphoxEmbed.get()) {
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
      }

      writer.end(name);
    }
  }, Schema({})).parse(html);

  return writer.getContent();
};

export {
  updateHtml
};
