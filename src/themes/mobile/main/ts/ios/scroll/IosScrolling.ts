import { Fun, Future } from '@ephox/katamari';
import { Attr, Css, Traverse } from '@ephox/sugar';

import Styles from '../../style/Styles';
import DataAttributes from '../../util/DataAttributes';
import SmoothAnimation from '../smooth/SmoothAnimation';
import IosViewport from '../view/IosViewport';

const animator = SmoothAnimation.create();

const ANIMATION_STEP = 15;
const NUM_TOP_ANIMATION_FRAMES = 10;
const ANIMATION_RATE = 10;

const lastScroll = 'data-' + Styles.resolve('last-scroll-top');

const getTop = function (element) {
  const raw = Css.getRaw(element, 'top').getOr(0);
  return parseInt(raw, 10);
};

const getScrollTop = function (element) {
  return parseInt(element.dom().scrollTop, 10);
};

const moveScrollAndTop = function (element, destination, finalTop) {
  return Future.nu(function (callback) {
    const getCurrent = Fun.curry(getScrollTop, element);

    const update = function (newScroll) {
      element.dom().scrollTop = newScroll;
      Css.set(element, 'top', (getTop(element) + ANIMATION_STEP) + 'px');
    };

    const finish = function (/* dest */) {
      element.dom().scrollTop = destination;
      Css.set(element, 'top', finalTop + 'px');
      callback(destination);
    };

    animator.animate(getCurrent, destination, ANIMATION_STEP, update, finish, ANIMATION_RATE);
  });
};

const moveOnlyScroll = function (element, destination) {
  return Future.nu(function (callback) {
    const getCurrent = Fun.curry(getScrollTop, element);
    Attr.set(element, lastScroll, getCurrent());

    const update = function (newScroll, abort) {
      const previous = DataAttributes.safeParse(element, lastScroll);
      // As soon as we detect a scroll value that we didn't set, assume the user
      // is scrolling, and abort the scrolling.
      if (previous !== element.dom().scrollTop) {
        abort(element.dom().scrollTop);
      } else {
        element.dom().scrollTop = newScroll;
        Attr.set(element, lastScroll, newScroll);
      }
    };

    const finish = function (/* dest */) {
      element.dom().scrollTop = destination;
      Attr.set(element, lastScroll, destination);
      callback(destination);
    };

    // Identify the number of steps based on distance (consistent time)
    const distance = Math.abs(destination - getCurrent());
    const step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
    animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
  });
};

const moveOnlyTop = function (element, destination) {
  return Future.nu(function (callback) {
    const getCurrent = Fun.curry(getTop, element);

    const update = function (newTop) {
      Css.set(element, 'top', newTop + 'px');
    };

    const finish = function (/* dest */) {
      update(destination);
      callback(destination);
    };

    const distance = Math.abs(destination - getCurrent());
    const step = Math.ceil(distance / NUM_TOP_ANIMATION_FRAMES);
    animator.animate(getCurrent, destination, step, update, finish, ANIMATION_RATE);
  });
};

const updateTop = function (element, amount) {
  const newTop = (amount + IosViewport.getYFixedData(element)) + 'px';
  Css.set(element, 'top', newTop);
};

// Previously, we moved the window scroll back smoothly with the SmoothAnimation concept.
// However, on tinyMCE, we seemed to get a lot more cursor flickering as the window scroll
// was changing. Therefore, until tests prove otherwise, we are just going to jump to the
// destination in one go.
const moveWindowScroll = function (toolbar, viewport, destY) {
  const outerWindow = Traverse.owner(toolbar).dom().defaultView;
  return Future.nu(function (callback) {
    updateTop(toolbar, destY);
    updateTop(viewport, destY);
    outerWindow.scrollTo(0, destY);
    callback(destY);
  });
};

export default {
  moveScrollAndTop,
  moveOnlyScroll,
  moveOnlyTop,
  moveWindowScroll
};