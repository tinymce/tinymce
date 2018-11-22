/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomUtils from './DomUtils';
import UiContainer from 'tinymce/ui/UiContainer';
import { Element, document, window } from '@ephox/dom-globals';

/**
 * Movable mixin. Makes controls movable absolute and relative to other elements.
 *
 * @mixin tinymce.ui.Movable
 */

const isStatic = (elm: Element) => DomUtils.getRuntimeStyle(elm, 'position') === 'static';
const isFixed = (ctrl) => ctrl.state.get('fixed');

function calculateRelativePosition(ctrl, targetElm, rel) {
  let ctrlElm, pos, x, y, selfW, selfH, targetW, targetH, viewport, size;

  viewport = getWindowViewPort();

  // Get pos of target
  pos = DomUtils.getPos(targetElm, UiContainer.getUiContainer(ctrl));
  x = pos.x;
  y = pos.y;

  if (isFixed(ctrl) && isStatic(document.body)) {
    x -= viewport.x;
    y -= viewport.y;
  }

  // Get size of self
  ctrlElm = ctrl.getEl();
  size = DomUtils.getSize(ctrlElm);
  selfW = size.width;
  selfH = size.height;

  // Get size of target
  size = DomUtils.getSize(targetElm);
  targetW = size.width;
  targetH = size.height;

  // Parse align string
  rel = (rel || '').split('');

  // Target corners
  if (rel[0] === 'b') {
    y += targetH;
  }

  if (rel[1] === 'r') {
    x += targetW;
  }

  if (rel[0] === 'c') {
    y += Math.round(targetH / 2);
  }

  if (rel[1] === 'c') {
    x += Math.round(targetW / 2);
  }

  // Self corners
  if (rel[3] === 'b') {
    y -= selfH;
  }

  if (rel[4] === 'r') {
    x -= selfW;
  }

  if (rel[3] === 'c') {
    y -= Math.round(selfH / 2);
  }

  if (rel[4] === 'c') {
    x -= Math.round(selfW / 2);
  }

  return {
    x,
    y,
    w: selfW,
    h: selfH
  };
}

const getUiContainerViewPort = (customUiContainer) => {
  return {
    x: 0,
    y: 0,
    w: customUiContainer.scrollWidth - 1,
    h: customUiContainer.scrollHeight - 1
  };
};

// It seems that people are relying on the fact that we contrain to the visible window viewport instead of the document viewport
// const getDocumentViewPort = () => {
//   return {
//     x: Math.max(document.body.scrollLeft, document.documentElement.scrollLeft),
//     y: Math.max(document.body.scrollTop, document.documentElement.scrollTop),
//     w: Math.max(document.body.scrollWidth, document.documentElement.scrollWidth, document.defaultView.innerWidth),
//     h: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.defaultView.innerHeight)
//   };
// };

const getWindowViewPort = () => {
  const win = window;
  const x = Math.max(win.pageXOffset, document.body.scrollLeft, document.documentElement.scrollLeft);
  const y = Math.max(win.pageYOffset, document.body.scrollTop, document.documentElement.scrollTop);
  const w = win.innerWidth || document.documentElement.clientWidth;
  const h = win.innerHeight || document.documentElement.clientHeight;

  return {
    x,
    y,
    w,
    h
  };
};

const getViewPortRect = (ctrl) => {
  const customUiContainer = UiContainer.getUiContainer(ctrl);
  return customUiContainer && !isFixed(ctrl) ? getUiContainerViewPort(customUiContainer) : getWindowViewPort();
};

export default {
  /**
   * Tests various positions to get the most suitable one.
   *
   * @method testMoveRel
   * @param {DOMElement} elm Element to position against.
   * @param {Array} rels Array with relative positions.
   * @return {String} Best suitable relative position.
   */
  testMoveRel (elm, rels) {
    const viewPortRect = getViewPortRect(this);

    for (let i = 0; i < rels.length; i++) {
      const pos = calculateRelativePosition(this, elm, rels[i]);

      if (isFixed(this)) {
        if (pos.x > 0 && pos.x + pos.w < viewPortRect.w && pos.y > 0 && pos.y + pos.h < viewPortRect.h) {
          return rels[i];
        }
      } else {
        if (pos.x > viewPortRect.x && pos.x + pos.w < viewPortRect.w + viewPortRect.x && pos.y > viewPortRect.y && pos.y + pos.h < viewPortRect.h + viewPortRect.y) {
          return rels[i];
        }
      }
    }

    return rels[0];
  },

  /**
   * Move relative to the specified element.
   *
   * @method moveRel
   * @param {Element} elm Element to move relative to.
   * @param {String} rel Relative mode. For example: br-tl.
   * @return {tinymce.ui.Control} Current control instance.
   */
  moveRel (elm, rel) {
    if (typeof rel !== 'string') {
      rel = this.testMoveRel(elm, rel);
    }

    const pos = calculateRelativePosition(this, elm, rel);
    return this.moveTo(pos.x, pos.y);
  },

  /**
   * Move by a relative x, y values.
   *
   * @method moveBy
   * @param {Number} dx Relative x position.
   * @param {Number} dy Relative y position.
   * @return {tinymce.ui.Control} Current control instance.
   */
  moveBy (dx, dy) {
    const self = this, rect = self.layoutRect();

    self.moveTo(rect.x + dx, rect.y + dy);

    return self;
  },

  /**
   * Move to absolute position.
   *
   * @method moveTo
   * @param {Number} x Absolute x position.
   * @param {Number} y Absolute y position.
   * @return {tinymce.ui.Control} Current control instance.
   */
  moveTo (x, y) {
    const self = this;

    // TODO: Move this to some global class
    function constrain(value, max, size) {
      if (value < 0) {
        return 0;
      }

      if (value + size > max) {
        value = max - size;
        return value < 0 ? 0 : value;
      }

      return value;
    }

    if (self.settings.constrainToViewport) {
      const viewPortRect = getViewPortRect(this);
      const layoutRect = self.layoutRect();

      x = constrain(x, viewPortRect.w + viewPortRect.x, layoutRect.w);
      y = constrain(y, viewPortRect.h + viewPortRect.y, layoutRect.h);
    }

    const uiContainer = UiContainer.getUiContainer(self);
    if (uiContainer && isStatic(uiContainer) && !isFixed(self)) {
      x -= uiContainer.scrollLeft;
      y -= uiContainer.scrollTop;
    }

    // We need to transpose by 1x1 on all browsers when using a ui container for some odd reason
    if (uiContainer) {
      x += 1;
      y += 1;
    }

    if (self.state.get('rendered')) {
      self.layoutRect({ x, y }).repaint();
    } else {
      self.settings.x = x;
      self.settings.y = y;
    }

    self.fire('move', { x, y });

    return self;
  }
};