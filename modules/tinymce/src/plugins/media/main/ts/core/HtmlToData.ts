/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { HTMLElement, Node } from '@ephox/dom-globals';
import Tools from 'tinymce/core/api/util/Tools';
import SaxParser from 'tinymce/core/api/html/SaxParser';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Size from './Size';
import { MediaData } from './Types';
import { VideoScript, getVideoScriptMatch } from './VideoScript';

const DOM = DOMUtils.DOM;

const getEphoxEmbedIri = function (elm: Node): string {
  return DOM.getAttrib(elm, 'data-ephox-embed-iri');
};

const isEphoxEmbed = function (html: string): boolean {
  const fragment = DOM.createFragment(html);
  return getEphoxEmbedIri(fragment.firstChild) !== '';
};

const htmlToDataSax = function (prefixes: VideoScript[], html: string): MediaData {
  let data: any = {};

  SaxParser({
    validate: false,
    allow_conditional_comments: true,
    start (name, attrs) {
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
        const videoScript = getVideoScriptMatch(prefixes, attrs.map.src);
        if (!videoScript) {
          return;
        }

        data = {
          type: 'script',
          source1: attrs.map.src,
          width: String(videoScript.width),
          height: String(videoScript.height)
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
  }).parse(html);

  data.source1 = data.source1 || data.src || data.data;
  data.source2 = data.source2 || '';
  data.poster = data.poster || '';

  return data;
};

const ephoxEmbedHtmlToData = function (html: string): MediaData {
  const fragment = DOM.createFragment(html);
  const div = fragment.firstChild as HTMLElement;

  return {
    type: 'ephox-embed-iri',
    source1: getEphoxEmbedIri(div),
    source2: '',
    poster: '',
    width: Size.getMaxWidth(div),
    height: Size.getMaxHeight(div)
  };
};

const htmlToData = function (prefixes: VideoScript[], html: string): MediaData {
  return isEphoxEmbed(html) ? ephoxEmbedHtmlToData(html) : htmlToDataSax(prefixes, html);
};

export {
  htmlToData
};
