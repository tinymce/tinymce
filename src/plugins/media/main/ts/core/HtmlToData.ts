/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import SaxParser from 'tinymce/core/api/html/SaxParser';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import VideoScript from './VideoScript';
import Size from './Size';

const DOM = DOMUtils.DOM;

const getEphoxEmbedIri = function (elm) {
  return DOM.getAttrib(elm, 'data-ephox-embed-iri');
};

const isEphoxEmbed = function (html) {
  const fragment = DOM.createFragment(html);
  return getEphoxEmbedIri(fragment.firstChild) !== '';
};

const htmlToDataSax = function (prefixes, html) {
  let data: any = {};

  SaxParser({
    validate: false,
    allow_conditional_comments: true,
    special: 'script,noscript',
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
  }).parse(html);

  data.source1 = data.source1 || data.src || data.data;
  data.source2 = data.source2 || '';
  data.poster = data.poster || '';

  return data;
};

const ephoxEmbedHtmlToData = function (html) {
  const fragment = DOM.createFragment(html);
  const div = fragment.firstChild;

  return {
    type: 'ephox-embed-iri',
    source1: getEphoxEmbedIri(div),
    source2: '',
    poster: '',
    width: Size.getMaxWidth(div),
    height: Size.getMaxHeight(div)
  };
};

const htmlToData = function (prefixes, html) {
  return isEphoxEmbed(html) ? ephoxEmbedHtmlToData(html) : htmlToDataSax(prefixes, html);
};

export default {
  htmlToData
};