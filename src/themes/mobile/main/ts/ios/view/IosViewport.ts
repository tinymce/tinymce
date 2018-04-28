import { Adt, Arr, Fun } from '@ephox/katamari';
import { Attr, Css, Height, SelectorFilter, Traverse } from '@ephox/sugar';

import Styles from '../../style/Styles';
import Scrollable from '../../touch/scroll/Scrollable';
import DataAttributes from '../../util/DataAttributes';
import DeviceZones from './DeviceZones';

const fixture = Adt.generate([
  { fixed: [ 'element', 'property', 'offsetY' ] },
  // Not supporting property yet
  { scroller : [ 'element', 'offsetY' ] }
]);

const yFixedData = 'data-' + Styles.resolve('position-y-fixed');
const yFixedProperty = 'data-' + Styles.resolve('y-property');
const yScrollingData = 'data-' + Styles.resolve('scrolling');
const windowSizeData = 'data-' + Styles.resolve('last-window-height');

const getYFixedData = function (element) {
  return DataAttributes.safeParse(element, yFixedData);
};

const getYFixedProperty = function (element) {
  return Attr.get(element, yFixedProperty);
};

const getLastWindowSize = function (element) {
  return DataAttributes.safeParse(element, windowSizeData);
};

const classifyFixed = function (element, offsetY) {
  const prop = getYFixedProperty(element);
  return fixture.fixed(element, prop, offsetY);
};

const classifyScrolling = function (element, offsetY) {
  return fixture.scroller(element, offsetY);
};

const classify = function (element) {
  const offsetY = getYFixedData(element);
  const classifier = Attr.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
  return classifier(element, offsetY);
};

const findFixtures = function (container) {
  const candidates = SelectorFilter.descendants(container, '[' + yFixedData + ']');
  return Arr.map(candidates, classify);
};

const takeoverToolbar = function (toolbar) {
  const oldToolbarStyle = Attr.get(toolbar, 'style');
  Css.setAll(toolbar, {
    position: 'absolute',
    top: '0px'
  });

  Attr.set(toolbar, yFixedData, '0px');
  Attr.set(toolbar, yFixedProperty, 'top');

  const restore = function () {
    Attr.set(toolbar, 'style', oldToolbarStyle || '');
    Attr.remove(toolbar, yFixedData);
    Attr.remove(toolbar, yFixedProperty);
  };

  return {
    restore
  };
};

const takeoverViewport = function (toolbarHeight, height, viewport) {
  const oldViewportStyle = Attr.get(viewport, 'style');

  Scrollable.register(viewport);
  Css.setAll(viewport, {
    position: 'absolute',
    // I think there a class that does this overflow scrolling touch part
    height: height + 'px',
    width: '100%',
    top: toolbarHeight + 'px'
  });

  Attr.set(viewport, yFixedData, toolbarHeight + 'px');
  Attr.set(viewport, yScrollingData, 'true');
  Attr.set(viewport, yFixedProperty, 'top');

  const restore = function () {
    Scrollable.deregister(viewport);
    Attr.set(viewport, 'style', oldViewportStyle || '');
    Attr.remove(viewport, yFixedData);
    Attr.remove(viewport, yScrollingData);
    Attr.remove(viewport, yFixedProperty);
  };

  return {
    restore
  };
};

const takeoverDropup = function (dropup, toolbarHeight, viewportHeight) {
  const oldDropupStyle = Attr.get(dropup, 'style');
  Css.setAll(dropup, {
    position: 'absolute',
    bottom: '0px'
  });

  Attr.set(dropup, yFixedData, '0px');
  Attr.set(dropup, yFixedProperty, 'bottom');

  const restore = function () {
    Attr.set(dropup, 'style', oldDropupStyle || '');
    Attr.remove(dropup, yFixedData);
    Attr.remove(dropup, yFixedProperty);
  };

  return {
    restore
  };
};

const deriveViewportHeight = function (viewport, toolbarHeight, dropupHeight) {
  // Note, Mike thinks this value changes when the URL address bar grows and shrinks. If this value is too high
  // the main problem is that scrolling into the greenzone may not scroll into an area that is viewable. Investigate.
  const outerWindow = Traverse.owner(viewport).dom().defaultView;
  const winH = outerWindow.innerHeight;
  Attr.set(viewport, windowSizeData, winH + 'px');
  return winH - toolbarHeight - dropupHeight;
};

const takeover = function (viewport, contentBody, toolbar, dropup) {
  const outerWindow = Traverse.owner(viewport).dom().defaultView;
  const toolbarSetup = takeoverToolbar(toolbar);
  const toolbarHeight = Height.get(toolbar);
  const dropupHeight = Height.get(dropup);
  const viewportHeight = deriveViewportHeight(viewport, toolbarHeight, dropupHeight);

  const viewportSetup = takeoverViewport(toolbarHeight, viewportHeight, viewport);

  const dropupSetup = takeoverDropup(dropup, toolbarHeight, viewportHeight);

  let isActive = true;

  const restore = function () {
    isActive = false;
    toolbarSetup.restore();
    viewportSetup.restore();
    dropupSetup.restore();
  };

  const isExpanding = function () {
    const currentWinHeight = outerWindow.innerHeight;
    const lastWinHeight = getLastWindowSize(viewport);
    return currentWinHeight > lastWinHeight;
  };

  const refresh = function () {
    if (isActive) {
      const newToolbarHeight = Height.get(toolbar);
      const dropupHeight = Height.get(dropup);
      const newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight);
      Attr.set(viewport, yFixedData, newToolbarHeight + 'px');
      Css.set(viewport, 'height', newHeight + 'px');

      Css.set(dropup, 'bottom', -(newToolbarHeight + newHeight + dropupHeight) + 'px');
      DeviceZones.updatePadding(contentBody, viewport, dropup);
    }
  };

  const setViewportOffset = function (newYOffset) {
    const offsetPx = newYOffset + 'px';
    Attr.set(viewport, yFixedData, offsetPx);
    // The toolbar height has probably changed, so recalculate the viewport height.
    refresh();
  };

  DeviceZones.updatePadding(contentBody, viewport, dropup);

  return {
    setViewportOffset,
    isExpanding,
    isShrinking: Fun.not(isExpanding),
    refresh,
    restore
  };
};

export default {
  findFixtures,
  takeover,
  getYFixedData
};