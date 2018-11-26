/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import { document, window } from '@ephox/dom-globals';

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

function getDocumentSize(doc) {
  let documentElement, body, scrollWidth, clientWidth;
  let offsetWidth, scrollHeight, clientHeight, offsetHeight;
  const max = Math.max;

  documentElement = doc.documentElement;
  body = doc.body;

  scrollWidth = max(documentElement.scrollWidth, body.scrollWidth);
  clientWidth = max(documentElement.clientWidth, body.clientWidth);
  offsetWidth = max(documentElement.offsetWidth, body.offsetWidth);

  scrollHeight = max(documentElement.scrollHeight, body.scrollHeight);
  clientHeight = max(documentElement.clientHeight, body.clientHeight);
  offsetHeight = max(documentElement.offsetHeight, body.offsetHeight);

  return {
    width: scrollWidth < offsetWidth ? clientWidth : scrollWidth,
    height: scrollHeight < offsetHeight ? clientHeight : scrollHeight
  };
}

function updateWithTouchData(e) {
  let keys, i;

  if (e.changedTouches) {
    keys = 'screenX screenY pageX pageY clientX clientY'.split(' ');
    for (i = 0; i < keys.length; i++) {
      e[keys[i]] = e.changedTouches[0][keys[i]];
    }
  }
}

export default function (id, settings) {
  let $eventOverlay;
  const doc = settings.document || document;
  let downButton;
  let start, stop, drag, startX, startY;

  settings = settings || {};

  const handleElement = doc.getElementById(settings.handle || id);

  start = function (e) {
    const docSize = getDocumentSize(doc);
    let handleElm, cursor;

    updateWithTouchData(e);

    e.preventDefault();
    downButton = e.button;
    handleElm = handleElement;
    startX = e.screenX;
    startY = e.screenY;

    // Grab cursor from handle so we can place it on overlay
    if (window.getComputedStyle) {
      cursor = window.getComputedStyle(handleElm, null).getPropertyValue('cursor');
    } else {
      cursor = handleElm.runtimeStyle.cursor;
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

  drag = function (e) {
    updateWithTouchData(e);

    if (e.button !== downButton) {
      return stop(e);
    }

    e.deltaX = e.screenX - startX;
    e.deltaY = e.screenY - startY;

    e.preventDefault();
    settings.drag(e);
  };

  stop = function (e) {
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
  this.destroy = function () {
    DomQuery(handleElement).off();
  };

  DomQuery(handleElement).on('mousedown touchstart', start);
}
