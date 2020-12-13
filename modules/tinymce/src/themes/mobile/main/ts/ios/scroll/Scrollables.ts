/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { Attribute, DomEvent, SelectorFind } from '@ephox/sugar';

import * as Styles from '../../style/Styles';

const dataHorizontal = 'data-' + Styles.resolve('horizontal-scroll');

const canScrollVertically = (container) => {
  container.dom.scrollTop = 1;
  const result = container.dom.scrollTop !== 0;
  container.dom.scrollTop = 0;
  return result;
};

const canScrollHorizontally = (container) => {
  container.dom.scrollLeft = 1;
  const result = container.dom.scrollLeft !== 0;
  container.dom.scrollLeft = 0;
  return result;
};

const hasVerticalScroll = (container) => {
  return container.dom.scrollTop > 0 || canScrollVertically(container);
};

const hasHorizontalScroll = (container) => {
  return container.dom.scrollLeft > 0 || canScrollHorizontally(container);
};

const markAsHorizontal = (container) => {
  Attribute.set(container, dataHorizontal, 'true');
};

const hasScroll = (container) => {
  return Attribute.get(container, dataHorizontal) === 'true' ? hasHorizontalScroll(container) : hasVerticalScroll(container);
};

/*
 * Prevents default on touchmove for anything that is not within a scrollable area. The
 * scrollable areas are defined by selector.
 */
const exclusive = (scope, selector) => {
  return DomEvent.bind(scope, 'touchmove', (event) => {
    SelectorFind.closest(event.target, selector).filter(hasScroll).fold(() => {
      event.prevent();
    }, Fun.noop);
  });
};

export {
  exclusive,
  markAsHorizontal
};
