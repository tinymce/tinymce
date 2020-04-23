/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell, Obj } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import SaxParser from 'tinymce/core/api/html/SaxParser';
import Tools from 'tinymce/core/api/util/Tools';
import { MediaData } from './Types';
import { getVideoScriptMatch, VideoScript } from './VideoScript';

type AttrList = Array<{ name: string; value: string }> & { map: Record<string, string> };

const DOM = DOMUtils.DOM;

const trimPx = (value: string) => value.replace(/px$/, '');

const getEphoxEmbedData = (attrs: AttrList): MediaData => {
  const style = attrs.map.style;
  const styles = style ? DOM.parseStyle(style) : { };
  return {
    type: 'ephox-embed-iri',
    source: attrs.map['data-ephox-embed-iri'],
    altsource: '',
    poster: '',
    width: Obj.get(styles, 'max-width').map(trimPx).getOr(''),
    height: Obj.get(styles, 'max-height').map(trimPx).getOr('')
  };
};

const htmlToData = (prefixes: VideoScript[], html: string): MediaData => {
  const isEphoxEmbed = Cell<boolean>(false);
  let data: any = {};

  SaxParser({
    validate: false,
    allow_conditional_comments: true,
    start(name, attrs) {
      if (isEphoxEmbed.get()) {
        // Ignore any child elements if handling an EME embed
      } else if (Obj.has(attrs.map, 'data-ephox-embed-iri')) {
        isEphoxEmbed.set(true);
        data = getEphoxEmbedData(attrs);
      } else {
        if (!data.source && name === 'param') {
          data.source = attrs.map.movie;
        }

        if (name === 'iframe' || name === 'object' || name === 'embed' || name === 'video' || name === 'audio') {
          if (!data.type) {
            data.type = name;
          }

          data = Tools.extend(attrs.map, data);
        }

        if (name === 'script') {
          const videoScript = getVideoScriptMatch(prefixes, attrs.map.src);
          if (!videoScript) {
            return;
          }

          data = {
            type: 'script',
            source: attrs.map.src,
            width: String(videoScript.width),
            height: String(videoScript.height)
          };
        }

        if (name === 'source') {
          if (!data.source) {
            data.source = attrs.map.src;
          } else if (!data.altsource) {
            data.altsource = attrs.map.src;
          }
        }

        if (name === 'img' && !data.poster) {
          data.poster = attrs.map.src;
        }
      }
    }
  }).parse(html);

  data.source = data.source || data.src || data.data;
  data.altsource = data.altsource || '';
  data.poster = data.poster || '';

  return data;
};

export {
  htmlToData
};
