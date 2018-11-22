/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';

const getUiContainerDelta = function (ctrl) {
  const uiContainer = getUiContainer(ctrl);
  if (uiContainer && DOMUtils.DOM.getStyle(uiContainer, 'position', true) !== 'static') {
    const containerPos = DOMUtils.DOM.getPos(uiContainer);
    const dx = uiContainer.scrollLeft - containerPos.x;
    const dy = uiContainer.scrollTop - containerPos.y;
    return Option.some({
      x: dx,
      y: dy
    });
  } else {
    return Option.none();
  }
};

const setUiContainer = (editor, ctrl) => {
  const uiContainer = DOMUtils.DOM.select(editor.settings.ui_container)[0];
  ctrl.getRoot().uiContainer = uiContainer;
};

const getUiContainer = (ctrl) => ctrl ? ctrl.getRoot().uiContainer : null;
const inheritUiContainer = (fromCtrl, toCtrl) => toCtrl.uiContainer = getUiContainer(fromCtrl);

export default {
  getUiContainerDelta,
  setUiContainer,
  getUiContainer,
  inheritUiContainer
};