/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomQuery from 'tinymce/core/api/dom/DomQuery';

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

const updateWithTouchData = (e) => {
  let keys, i;

  if (e.changedTouches) {
    keys = 'screenX screenY pageX pageY clientX clientY'.split(' ');
    for (i = 0; i < keys.length; i++) {
      e[keys[i]] = e.changedTouches[0][keys[i]];
    }
  }
};

export default (id: string, settings: DragHelperSettings) => {
  let $eventOverlay;
  const doc = settings.document || document;
  let downButton;
  let startX, startY;

  const handleElement = doc.getElementById(settings.handle || id);

  const start = (e) => {
    const docSize = getDocumentSize(doc);
    let cursor;

    updateWithTouchData(e);

    e.preventDefault();
    downButton = e.button;
    const handleElm = handleElement;
    startX = e.screenX;
    startY = e.screenY;

    // Grab cursor from handle so we can place it on overlay
    if (window.getComputedStyle) {
      cursor = window.getComputedStyle(handleElm, null).getPropertyValue('cursor');
    } else {
      // Old IE styles
      cursor = (handleElm as any).runtimeStyle.cursor;
    }

    $eventOverlay = DomQuery('<div></div>').css({
      position: 'absolute',
      top: 0, left: 0,
      width: docSize.width,
      height: docSize.height,
      zIndex: 0x7FFFFFFF,
      opacity: 0.0001,
      cursor
    }).appendTo(doc.body);

    DomQuery(doc).on('mousemove touchmove', drag).on('mouseup touchend', stop);

    settings.start(e);
  };

  const drag = (e) => {
    updateWithTouchData(e);

    if (e.button !== downButton) {
      return stop(e);
    }

    e.deltaX = e.screenX - startX;
    e.deltaY = e.screenY - startY;

    e.preventDefault();
    settings.drag(e);
  };

  const stop = (e) => {
    updateWithTouchData(e);

    DomQuery(doc).off('mousemove touchmove', drag).off('mouseup touchend', stop);

    $eventOverlay.remove();

    if (settings.stop) {
      settings.stop(e);
    }
  };

  /**
   * Destroys the drag/drop helper instance.
   *
   * @method destroy
   */
  const destroy = () => {
    DomQuery(handleElement).off();
  };

  DomQuery(handleElement).on('mousedown touchstart', start);

  return {
    destroy
  };
};
