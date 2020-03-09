/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Adt, Arr, Fun } from '@ephox/katamari';
import { Attr, Css, Element, Height, SelectorFilter, Traverse } from '@ephox/sugar';
import { Element as DomElement, Node as DomNode, HTMLElement } from '@ephox/dom-globals';

import * as Styles from '../../style/Styles';
import * as Scrollable from '../../touch/scroll/Scrollable';
import * as DataAttributes from '../../util/DataAttributes';
import * as DeviceZones from './DeviceZones';

const fixture = Adt.generate([
  { fixed: [ 'element', 'property', 'offsetY' ] },
  // Not supporting property yet
  { scroller : [ 'element', 'offsetY' ] }
]);

const yFixedData = 'data-' + Styles.resolve('position-y-fixed');
const yFixedProperty = 'data-' + Styles.resolve('y-property');
const yScrollingData = 'data-' + Styles.resolve('scrolling');
const windowSizeData = 'data-' + Styles.resolve('last-window-height');

const getYFixedData = (element: Element<DomElement>): number =>
  DataAttributes.safeParse(element, yFixedData);

const getYFixedProperty = (element: Element<DomElement>): string =>
  Attr.get(element, yFixedProperty);

const getLastWindowSize = (element: Element<DomElement>): number =>
  DataAttributes.safeParse(element, windowSizeData);

const classifyFixed = (element: Element<DomElement>, offsetY: number) => {
  const prop = getYFixedProperty(element);
  return fixture.fixed(element, prop, offsetY);
};

const classifyScrolling = (element: Element<DomElement>, offsetY: number) =>
  fixture.scroller(element, offsetY);

const classify = (element: Element<DomElement>) => {
  const offsetY = getYFixedData(element);
  const classifier = Attr.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
  return classifier(element, offsetY);
};

const findFixtures = (container: Element<DomElement>) => {
  const candidates = SelectorFilter.descendants(container, '[' + yFixedData + ']');
  return Arr.map(candidates, classify);
};

const takeoverToolbar = (toolbar: Element<DomElement>): { restore: () => void } => {
  const oldToolbarStyle = Attr.get(toolbar, 'style');
  Css.setAll(toolbar, {
    position: 'absolute',
    top: '0px'
  });

  Attr.set(toolbar, yFixedData, '0px');
  Attr.set(toolbar, yFixedProperty, 'top');

  const restore = () => {
    Attr.set(toolbar, 'style', oldToolbarStyle || '');
    Attr.remove(toolbar, yFixedData);
    Attr.remove(toolbar, yFixedProperty);
  };

  return {
    restore
  };
};

const takeoverViewport = (toolbarHeight: number, height: number, viewport: Element<DomElement>): { restore: () => void } => {
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

  const restore = () => {
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

const takeoverDropup = (dropup: Element<DomElement>): { restore: () => void } => {
  const oldDropupStyle = Attr.get(dropup, 'style');
  Css.setAll(dropup, {
    position: 'absolute',
    bottom: '0px'
  });

  Attr.set(dropup, yFixedData, '0px');
  Attr.set(dropup, yFixedProperty, 'bottom');

  const restore = () => {
    Attr.set(dropup, 'style', oldDropupStyle || '');
    Attr.remove(dropup, yFixedData);
    Attr.remove(dropup, yFixedProperty);
  };

  return {
    restore
  };
};

const deriveViewportHeight = (viewport: Element<DomElement>, toolbarHeight: number, dropupHeight: number) => {
  // Note, Mike thinks this value changes when the URL address bar grows and shrinks. If this value is too high
  // the main problem is that scrolling into the greenzone may not scroll into an area that is viewable. Investigate.
  const outerWindow = Traverse.owner(viewport).dom().defaultView;
  const winH = outerWindow.innerHeight;
  Attr.set(viewport, windowSizeData, winH + 'px');
  return winH - toolbarHeight - dropupHeight;
};

const takeover = (viewport: Element<HTMLElement>, contentBody: Element<DomNode>, toolbar: Element<HTMLElement>, dropup: Element<HTMLElement>) => {
  const outerWindow = Traverse.owner(viewport).dom().defaultView;
  const toolbarSetup = takeoverToolbar(toolbar);
  const toolbarHeight = Height.get(toolbar);
  const dropupHeight = Height.get(dropup);
  const viewportHeight = deriveViewportHeight(viewport, toolbarHeight, dropupHeight);

  const viewportSetup = takeoverViewport(toolbarHeight, viewportHeight, viewport);

  const dropupSetup = takeoverDropup(dropup);

  let isActive = true;

  const restore = (): void => {
    isActive = false;
    toolbarSetup.restore();
    viewportSetup.restore();
    dropupSetup.restore();
  };

  const isExpanding = (): boolean => {
    const currentWinHeight = outerWindow.innerHeight;
    const lastWinHeight = getLastWindowSize(viewport);
    return currentWinHeight > lastWinHeight;
  };

  const refresh = (): void => {
    if (isActive) {
      const newToolbarHeight = Height.get(toolbar);
      const dropupHeight = Height.get(dropup);
      const newHeight = deriveViewportHeight(viewport, newToolbarHeight, dropupHeight);
      Attr.set(viewport, yFixedData, newToolbarHeight + 'px');
      Css.set(viewport, 'height', newHeight + 'px');

      DeviceZones.updatePadding(contentBody, viewport, dropup);
    }
  };

  const setViewportOffset = (newYOffset: number): void => {
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

export {
  findFixtures,
  takeover,
  getYFixedData
};
