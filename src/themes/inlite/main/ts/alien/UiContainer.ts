/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const getUiContainerDelta = function (uiContainer): Option<{x: number, y: number}> {
  if (uiContainer && DOMUtils.DOM.getStyle(uiContainer, 'position', true) !== 'static') {
    const containerPos = DOMUtils.DOM.getPos(uiContainer);
    const dx = containerPos.x - uiContainer.scrollLeft;
    const dy = containerPos.y - uiContainer.scrollTop;
    return Option.some({
      x: dx,
      y: dy
    });
  } else {
    return Option.none();
  }
};

export default {
  getUiContainerDelta
};