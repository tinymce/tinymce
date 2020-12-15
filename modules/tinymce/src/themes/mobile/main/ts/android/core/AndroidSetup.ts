/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';
import { Attribute, DomEvent, RawRect, SugarElement } from '@ephox/sugar';

import * as Styles from '../../style/Styles';
import * as DataAttributes from '../../util/DataAttributes';
import * as Rectangles from '../../util/Rectangles';
import * as ResumeEditing from '../focus/ResumeEditing';

// This amount is added to the minimum scrolling distance when calculating how much to scroll
// because the soft keyboard has appeared.
const EXTRA_SPACING = 50;

const data = 'data-' + Styles.resolve('last-outer-height');

const setLastHeight = function (cBody, value) {
  Attribute.set(cBody, data, value);
};

const getLastHeight = function (cBody) {
  return DataAttributes.safeParse(cBody, data);
};

const getBoundsFrom = function (rect: RawRect) {
  return {
    top: rect.top,
    bottom: rect.top + rect.height
  };
};

const getBounds = function (cWin) {
  const rects = Rectangles.getRectangles(cWin);
  return rects.length > 0 ? Optional.some(rects[0]).map(getBoundsFrom) : Optional.none();
};

const findDelta = function (outerWindow, cBody) {
  const last = getLastHeight(cBody);
  const current = outerWindow.innerHeight;
  return last > current ? Optional.some(last - current) : Optional.none();
};

const calculate = function (cWin, bounds, delta) {
  // The goal here is to shift as little as required.
  const isOutside = bounds.top > cWin.innerHeight || bounds.bottom > cWin.innerHeight;
  return isOutside ? Math.min(delta, bounds.bottom - cWin.innerHeight + EXTRA_SPACING) : 0;
};

const setup = function (outerWindow, cWin) {
  const cBody = SugarElement.fromDom(cWin.document.body);

  const toEditing = function () {
    // TBIO-3816 throttling the resume was causing keyboard hide/show issues with undo/redo
    // throttling was introduced to work around a different keyboard hide/show issue, where
    // async uiChanged in Processor in polish was causing keyboard hide, which no longer seems to occur
    ResumeEditing.resume(cWin);
  };

  const onResize = DomEvent.bind(SugarElement.fromDom(outerWindow), 'resize', () => {

    findDelta(outerWindow, cBody).each((delta) => {
      getBounds(cWin).each((bounds) => {
        // If the top is offscreen, scroll it into view.
        const cScrollBy = calculate(cWin, bounds, delta);
        if (cScrollBy !== 0) {
          cWin.scrollTo(cWin.pageXOffset, cWin.pageYOffset + cScrollBy);
        }
      });
    });
    setLastHeight(cBody, outerWindow.innerHeight);
  });

  setLastHeight(cBody, outerWindow.innerHeight);

  const destroy = function () {
    onResize.unbind();
  };

  return {
    toEditing,
    destroy
  };
};

export {
  setup
};
