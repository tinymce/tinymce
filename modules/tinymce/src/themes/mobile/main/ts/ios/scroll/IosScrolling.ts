/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun, Future } from '@ephox/katamari';
import { Attribute, Css, Traverse } from '@ephox/sugar';

import * as Styles from '../../style/Styles';
import * as DataAttributes from '../../util/DataAttributes';
import * as SmoothAnimation from '../smooth/SmoothAnimation';
import * as IosViewport from '../view/IosViewport';

const animator = SmoothAnimation.create();

const ANIMATION_STEP = 15;
const NUM_TOP_ANIMATION_FRAMES = 10;
const ANIMATION_RATE = 10;

const lastScroll = 'data-' + Styles.resolve('last-scroll-top');

const getTop = (element) => {
  const raw = Css.getRaw(element, 'top').getOr('0');
  return parseInt(raw, 10);
};

const getScrollTop = (element) => {
  return parseInt(element.dom.scrollTop, 10);
};

const moveScrollAndTop = (element, destination, finalTop) => {
  return Future.nu((callback) => {
    const getCurrent = Fun.curry(getScrollTop, element);

    const update = (newScroll) => {
      element.dom.scrollTop = newScroll;
      Css.set(element, 'top', (getTop(element) + ANIMATION_STEP) + 'px');
    };

    const finish = (/* dest */) => {
      element.dom.scrollTop = destination;
      Css.set(element, 'top', finalTop + 'px');
      callback(destination);
    };

    animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
  });
};

const moveOnlyScroll = (element, destination) => {
  return Future.nu((callback) => {
    const getCurrent = Fun.curry(getScrollTop, element);
    Attribute.set(element, lastScroll, getCurrent());

    const update = (newScroll, abort) => {
      const previous = DataAttributes.safeParse(element, lastScroll);
      // As soon as we detect a scroll value that we didn't set, assume the user
      // is scrolling, and abort the scrolling.
      if (previous !== element.dom.scrollTop) {
        abort(element.dom.scrollTop);
      } else {
        element.dom.scrollTop = newScroll;
        Attribute.set(element, lastScroll, newScroll);
      }
    };

    const finish = (/* dest */) => {
      element.dom.scrollTop = destination;
      Attribute.set(element, lastScroll, destination);
      callback(destination);
    };

    // Identify the number of steps based on distance (consistent time)
    const distance = Math.abs(destination - getCurrent());
    const step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
    animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
  });
};

const moveOnlyTop = (element, destination) => {
  return Future.nu((callback) => {
    const getCurrent = Fun.curry(getTop, element);

    const update = (newTop) => {
      Css.set(element, 'top', newTop + 'px');
    };

    const finish = (/* dest */) => {
      update(destination);
      callback(destination);
    };

    const distance = Math.abs(destination - getCurrent());
    const step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
    animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
  });
};

const updateTop = (element, amount) => {
  const newTop = (amount + IosViewport.getYFixedData(element)) + 'px';
  Css.set(element, 'top', newTop);
};

// Previously, we moved the window scroll back smoothly with the SmoothAnimation concept.
// However, on tinyMCE, we seemed to get a lot more cursor flickering as the window scroll
// was changing. Therefore, until tests prove otherwise, we are just going to jump to the
// destination in one go.
const moveWindowScroll = (toolbar, viewport, destY) => {
  const outerWindow = Traverse.owner(toolbar).dom.defaultView;
  return Future.nu((callback) => {
    updateTop(toolbar, destY);
    updateTop(viewport, destY);
    outerWindow.scrollTo(0, destY);
    callback(destY);
  });
};

export {
  moveScrollAndTop,
  moveOnlyScroll,
  moveOnlyTop,
  moveWindowScroll
};
