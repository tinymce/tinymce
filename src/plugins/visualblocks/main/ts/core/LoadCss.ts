/**
 * LoadCss.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import Tools from 'tinymce/core/api/util/Tools';

const cssId = DOMUtils.DOM.uniqueId();

const load = function (doc, url) {
  const linkElements = Tools.toArray(doc.getElementsByTagName('link'));
  const matchingLinkElms = Tools.grep(linkElements, function (head) {
    return head.id === cssId;
  });

  if (matchingLinkElms.length === 0) {
    const linkElm = DOMUtils.DOM.create('link', {
      id: cssId,
      rel: 'stylesheet',
      href: url
    });

    doc.getElementsByTagName('head')[0].appendChild(linkElm);
  }
};

export default {
  load
};