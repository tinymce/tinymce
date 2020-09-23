/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Adt, Arr, Fun } from '@ephox/katamari';
import { Attribute, Css, Height, SelectorFilter, SugarElement, Traverse } from '@ephox/sugar';

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

const getYFixedData = (element: SugarElement<Element>): number =>
  DataAttributes.safeParse(element, yFixedData);

const getYFixedProperty = (element: SugarElement<Element>): string =>
  Attribute.get(element, yFixedProperty);

const getLastWindowSize = (element: SugarElement<Element>): number =>
  DataAttributes.safeParse(element, windowSizeData);

const classifyFixed = (element: SugarElement<Element>, offsetY: number) => {
  const prop = getYFixedProperty(element);
  return fixture.fixed(element, prop, offsetY);
};

const classifyScrolling = (element: SugarElement<Element>, offsetY: number) =>
  fixture.scroller(element, offsetY);

const classify = (element: SugarElement<Element>) => {
  const offsetY = getYFixedData(element);
  const classifier = Attribute.get(element, yScrollingData) === 'true' ? classifyScrolling : classifyFixed;
  return classifier(element, offsetY);
};

const findFixtures = (container: SugarElement<Element>) => {
  const candidates = SelectorFilter.descendants(container, '[' + yFixedData + ']');
  return Arr.map(candidates, classify);
};

const takeoverToolbar = (toolbar: SugarElement<Element>): { restore: () => void } => {
  const oldToolbarStyle = Attribute.get(toolbar, 'style');
  Css.setAll(toolbar, {
    position: 'absolute',
    top: '0px'
  });

  Attribute.set(toolbar, yFixedData, '0px');
  Attribute.set(toolbar, yFixedProperty, 'top');

  const restore = () => {
    Attribute.set(toolbar, 'style', oldToolbarStyle || '');
    Attribute.remove(toolbar, yFixedData);
    Attribute.remove(toolbar, yFixedProperty);
  };

  return {
    restore
  };
};

const takeoverViewport = (toolbarHeight: number, height: number, viewport: SugarElement<Element>): { restore: () => void } => {
  const oldViewportStyle = Attribute.get(viewport, 'style');

  Scrollable.register(viewport);
  Css.setAll(viewport, {
    position: 'absolute',
    // I think there a class that does this overflow scrolling touch part
    height: height + 'px',
    width: '100%',
    top: toolbarHeight + 'px'
  });

  Attribute.set(viewport, yFixedData, toolbarHeight + 'px');
  Attribute.set(viewport, yScrollingData, 'true');
  Attribute.set(viewport, yFixedProperty, 'top');

  const restore = () => {
    Scrollable.deregister(viewport);
    Attribute.set(viewport, 'style', oldViewportStyle || '');
    Attribute.remove(viewport, yFixedData);
    Attribute.remove(viewport, yScrollingData);
    Attribute.remove(viewport, yFixedProperty);
  };

  return {
    restore
  };
};

const takeoverDropup = (dropup: SugarElement<Element>): { restore: () => void } => {
  const oldDropupStyle = Attribute.get(dropup, 'style');
  Css.setAll(dropup, {
    position: 'absolute',
    bottom: '0px'
  });

  Attribute.set(dropup, yFixedData, '0px');
  Attribute.set(dropup, yFixedProperty, 'bottom');

  const restore = () => {
    Attribute.set(dropup, 'style', oldDropupStyle || '');
    Attribute.remove(dropup, yFixedData);
    Attribute.remove(dropup, yFixedProperty);
  };

  return {
    restore
  };
};

const deriveViewportHeight = (viewport: SugarElement<Element>, toolbarHeight: number, dropupHeight: number) => {
  // Note, Mike thinks this value changes when the URL address bar grows and shrinks. If this value is too high
  // the main problem is that scrolling into the greenzone may not scroll into an area that is viewable. Investigate.
  const outerWindow = Traverse.owner(viewport).dom.defaultView;
  const winH = outerWindow.innerHeight;
  Attribute.set(viewport, windowSizeData, winH + 'px');
  return winH - toolbarHeight - dropupHeight;
};

const takeover = (viewport: SugarElement<HTMLElement>, contentBody: SugarElement<Node>, toolbar: SugarElement<HTMLElement>, dropup: SugarElement<HTMLElement>) => {
  const outerWindow = Traverse.owner(viewport).dom.defaultView;
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
      Attribute.set(viewport, yFixedData, newToolbarHeight + 'px');
      Css.set(viewport, 'height', newHeight + 'px');

      DeviceZones.updatePadding(contentBody, viewport, dropup);
    }
  };

  const setViewportOffset = (newYOffset: number): void => {
    const offsetPx = newYOffset + 'px';
    Attribute.set(viewport, yFixedData, offsetPx);
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
