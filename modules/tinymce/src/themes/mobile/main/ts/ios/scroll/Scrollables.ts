/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Attr, DomEvent, SelectorFind } from '@ephox/sugar';

import * as Styles from '../../style/Styles';

const dataHorizontal = 'data-' + Styles.resolve('horizontal-scroll');

const canScrollVertically = function (container) {
  container.dom().scrollTop = 1;
  const result = container.dom().scrollTop !== 0;
  container.dom().scrollTop = 0;
  return result;
};

const canScrollHorizontally = function (container) {
  container.dom().scrollLeft = 1;
  const result = container.dom().scrollLeft !== 0;
  container.dom().scrollLeft = 0;
  return result;
};

const hasVerticalScroll = function (container) {
  return container.dom().scrollTop > 0 || canScrollVertically(container);
};

const hasHorizontalScroll = function (container) {
  return container.dom().scrollLeft > 0 || canScrollHorizontally(container);
};

const markAsHorizontal = function (container) {
  Attr.set(container, dataHorizontal, 'true');
};

const hasScroll = function (container) {
  return Attr.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll(container) : hasVerticalScroll(container);
};

/*
 * Prevents default on touchmove for anything that is not within a scrollable area. The
 * scrollable areas are defined by selector.
 */
const exclusive = function (scope, selector) {
  return DomEvent.bind(scope, 'touchmove', function (event) {
    SelectorFind.closest(event.target(), selector).filter(hasScroll).fold(function () {
      event.raw().preventDefault();
    }, Fun.noop);
  });
};

export {
  exclusive,
  markAsHorizontal
};
