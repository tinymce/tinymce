/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
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