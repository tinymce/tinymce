/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Type } from '@ephox/katamari';
import { Css, DomEvent, EventArgs, EventUnbinder, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

/**
 * Drag/drop helper class.
 *
 * @example
 * var dragHelper = new tinymce.ui.DragHelper('mydiv', {
 *     start: function(document, window, evt) {
 *     },
 *
 *     drag: function(evt) {
 *     },
 *
 *     end: function(evt) {
 *     }
 * });
 *
 * @class tinymce.ui.DragHelper
 */

interface DragHelperSettings {
  document?: Document;
  root?: Document | ShadowRoot;
  handle?: string;
  start: (e: MouseEvent | TouchEvent) => void;
  drag: (e: (MouseEvent | TouchEvent) & { deltaX: number; deltaY: number }) => void;
  stop?: (e: MouseEvent | TouchEvent) => void;
}

const getDocumentSize = (doc: Document) => {
  const max = Math.max;

  const documentElement = doc.documentElement;
  const body = doc.body;

  const scrollWidth = max(documentElement.scrollWidth, body.scrollWidth);
  const clientWidth = max(documentElement.clientWidth, body.clientWidth);
  const offsetWidth = max(documentElement.offsetWidth, body.offsetWidth);

  const scrollHeight = max(documentElement.scrollHeight, body.scrollHeight);
  const clientHeight = max(documentElement.clientHeight, body.clientHeight);
  const offsetHeight = max(documentElement.offsetHeight, body.offsetHeight);

  return {
    width: scrollWidth < offsetWidth ? clientWidth : scrollWidth,
    height: scrollHeight < offsetHeight ? clientHeight : scrollHeight
  };
};

const isTouchEvent = (e: MouseEvent | TouchEvent): e is TouchEvent =>
  Type.isNonNullable((e as TouchEvent).changedTouches);

const updateWithTouchData = (e: MouseEvent | TouchEvent) => {
  if (isTouchEvent(e)) {
    const keys = 'screenX screenY pageX pageY clientX clientY'.split(' ');
    for (let i = 0; i < keys.length; i++) {
      e[keys[i]] = e.changedTouches[0][keys[i]];
    }
  }
};

export default (id: string, settings: DragHelperSettings) => {
  let eventOverlay: SugarElement<HTMLDivElement> | undefined;
  let handleEvents: EventUnbinder[] = [];
  let overlayEvents: EventUnbinder[] = [];
  const doc = settings.document ?? document;
  const root = settings.root ?? doc;
  const sugarDoc = SugarElement.fromDom(doc);
  let downButton: number;
  let startX: number;
  let startY: number;

  const handleElement = SugarElement.fromDom(root.getElementById(settings.handle ?? id));

  const start = (e: EventArgs<MouseEvent | TouchEvent>) => {
    const rawEvent = e.raw as MouseEvent;
    const docSize = getDocumentSize(doc);

    updateWithTouchData(rawEvent);

    e.prevent();
    downButton = rawEvent.button;
    startX = rawEvent.screenX;
    startY = rawEvent.screenY;

    // Grab cursor from handle so we can place it on overlay
    const cursor = Css.get(handleElement, 'cursor');

    eventOverlay = SugarElement.fromTag('div', doc);
    Css.setAll(eventOverlay, {
      'position': 'absolute',
      'top': '0',
      'left': '0',
      'width': docSize.width + 'px',
      'height': docSize.height + 'px',
      'z-index': 0x7FFFFFFF + '',
      'opacity': '0.0001',
      cursor
    });
    Insert.append(SugarBody.getBody(sugarDoc), eventOverlay);

    overlayEvents.push(
      DomEvent.bind(sugarDoc, 'mousemove', drag),
      DomEvent.bind(sugarDoc, 'touchmove', drag),
      DomEvent.bind(sugarDoc, 'mouseup', stop),
      DomEvent.bind(sugarDoc, 'touchend', stop)
    );

    settings.start(rawEvent);
  };

  const drag = (e: EventArgs<MouseEvent | TouchEvent>) => {
    const rawEvent = e.raw as MouseEvent & { deltaX: number; deltaY: number };
    updateWithTouchData(rawEvent);

    if (rawEvent.button !== downButton) {
      return stop(e);
    }

    rawEvent.deltaX = rawEvent.screenX - startX;
    rawEvent.deltaY = rawEvent.screenY - startY;

    e.prevent();
    settings.drag(rawEvent);
  };

  const stop = (e: EventArgs<MouseEvent | TouchEvent>) => {
    updateWithTouchData(e.raw);

    Arr.each(overlayEvents, (e) => e.unbind());
    overlayEvents = [];

    Remove.remove(eventOverlay);

    if (settings.stop) {
      settings.stop(e.raw);
    }
  };

  /**
   * Destroys the drag/drop helper instance.
   *
   * @method destroy
   */
  const destroy = () => {
    Arr.each(overlayEvents.concat(handleEvents), (e) => e.unbind());
    overlayEvents = [];
    handleEvents = [];

    if (Type.isNonNullable(eventOverlay)) {
      Remove.remove(eventOverlay);
    }
  };

  handleEvents.push(
    DomEvent.bind(handleElement, 'mousedown', start),
    DomEvent.bind(handleElement, 'touchstart', start)
  );

  return {
    destroy
  };
};
