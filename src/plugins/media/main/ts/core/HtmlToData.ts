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
import VideoScript from './VideoScript';

type AttrList = Array<{ name: string, value: string }> & { map: Record<string, string> };

const DOM = DOMUtils.DOM;

const trimPx = (value: string) => value.replace(/px$/, '');

const getEphoxEmbedData = (attrs: AttrList) => {
  const style = attrs.map.style;
  const styles = style ? DOM.parseStyle(style) : { };
  return {
    type: 'ephox-embed-iri',
    source1: attrs.map['data-ephox-embed-iri'],
    source2: '',
    poster: '',
    width: Obj.get(styles, 'max-width').map(trimPx).getOr(''),
    height: Obj.get(styles, 'max-height').map(trimPx).getOr('')
  };
};

const htmlToData = (prefixes, html: string) => {
  const isEphoxEmbed = Cell<boolean>(false);
  let data: any = {};

  SaxParser({
    validate: false,
    allow_conditional_comments: true,
    special: 'script,noscript',
    start (name, attrs) {
      if (isEphoxEmbed.get()) {
        // Ignore any child elements if handling an EME embed
      } else if (Obj.has(attrs.map, 'data-ephox-embed-iri')) {
        isEphoxEmbed.set(true);
        data = getEphoxEmbedData(attrs);
      } else {
        if (!data.source1 && name === 'param') {
          data.source1 = attrs.map.movie;
        }

        if (name === 'iframe' || name === 'object' || name === 'embed' || name === 'video' || name === 'audio') {
          if (!data.type) {
            data.type = name;
          }

          data = Tools.extend(attrs.map, data);
        }

        if (name === 'script') {
          const videoScript = VideoScript.getVideoScriptMatch(prefixes, attrs.map.src);
          if (!videoScript) {
            return;
          }

          data = {
            type: 'script',
            source1: attrs.map.src,
            width: videoScript.width,
            height: videoScript.height
          };
        }

        if (name === 'source') {
          if (!data.source1) {
            data.source1 = attrs.map.src;
          } else if (!data.source2) {
            data.source2 = attrs.map.src;
          }
        }

        if (name === 'img' && !data.poster) {
          data.poster = attrs.map.src;
        }
      }
    }
  }).parse(html);

  data.source1 = data.source1 || data.src || data.data;
  data.source2 = data.source2 || '';
  data.poster = data.poster || '';

  return data;
};

export default {
  htmlToData
};