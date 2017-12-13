/**
 * HtmlToData.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Tools from 'tinymce/core/util/Tools';
import SaxParser from 'tinymce/core/html/SaxParser';
import Schema from 'tinymce/core/html/Schema';
import DOMUtils from 'tinymce/core/dom/DOMUtils';
import VideoScript from './VideoScript';
import Size from './Size';

var DOM = DOMUtils.DOM;

var getEphoxEmbedIri = function (elm) {
  return DOM.getAttrib(elm, 'data-ephox-embed-iri');
};

var isEphoxEmbed = function (html) {
  var fragment = DOM.createFragment(html);
  return getEphoxEmbedIri(fragment.firstChild) !== '';
};

var htmlToDataSax = function (prefixes, html) {
  var data: any = {};

  new SaxParser({
    validate: false,
    allow_conditional_comments: true,
    special: 'script,noscript',
    start: function (name, attrs) {
      if (!data.source1 && name === "param") {
        data.source1 = attrs.map.movie;
      }

      if (name === "iframe" || name === "object" || name === "embed" || name === "video" || name === "audio") {
        if (!data.type) {
          data.type = name;
        }

        data = Tools.extend(attrs.map, data);
      }

      if (name === "script") {
        var videoScript = VideoScript.getVideoScriptMatch(prefixes, attrs.map.src);
        if (!videoScript) {
          return;
        }

        data = {
          type: "script",
          source1: attrs.map.src,
          width: videoScript.width,
          height: videoScript.height
        };
      }

      if (name === "source") {
        if (!data.source1) {
          data.source1 = attrs.map.src;
        } else if (!data.source2) {
          data.source2 = attrs.map.src;
        }
      }

      if (name === "img" && !data.poster) {
        data.poster = attrs.map.src;
      }
    }
  }).parse(html);

  data.source1 = data.source1 || data.src || data.data;
  data.source2 = data.source2 || '';
  data.poster = data.poster || '';

  return data;
};

var ephoxEmbedHtmlToData = function (html) {
  var fragment = DOM.createFragment(html);
  var div = fragment.firstChild;

  return {
    type: 'ephox-embed-iri',
    source1: getEphoxEmbedIri(div),
    source2: '',
    poster: '',
    width: Size.getMaxWidth(div),
    height: Size.getMaxHeight(div)
  };
};

var htmlToData = function (prefixes, html) {
  return isEphoxEmbed(html) ? ephoxEmbedHtmlToData(html) : htmlToDataSax(prefixes, html);
};

export default <any> {
  htmlToData: htmlToData
};