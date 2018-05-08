/**
 * UiContainer.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Option } from '@ephox/katamari';
import Env from 'tinymce/core/api/Env';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const getUiContainerDelta = function (): Option<{x: number, y: number}> {
  const uiContainer = Env.container;
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