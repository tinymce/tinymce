/**
 * JSONP.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from '../dom/DOMUtils';

export default {
  callbacks: {},
  count: 0,

  send (settings) {
    const self = this, dom = DOMUtils.DOM, count = settings.count !== undefined ? settings.count : self.count;
    const id = 'tinymce_jsonp_' + count;

    self.callbacks[count] = function (json) {
      dom.remove(id);
      delete self.callbacks[count];

      settings.callback(json);
    };

    dom.add(dom.doc.body, 'script', {
      id,
      src: settings.url,
      type: 'text/javascript'
    });

    self.count++;
  }
};