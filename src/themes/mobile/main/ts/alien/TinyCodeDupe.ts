/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, window } from '@ephox/dom-globals';

/// TODO this code is from the tinymce link plugin, deduplicate when we decide how to share it
const openLink = function (target) {
  const link = document.createElement('a');
  link.target = '_blank';
  link.href = target.href;
  link.rel = 'noreferrer noopener';

  const nuEvt = document.createEvent('MouseEvents');
  nuEvt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

  document.body.appendChild(link);
  link.dispatchEvent(nuEvt);
  document.body.removeChild(link);
};

export default {
  openLink
};