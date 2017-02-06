/**
 * DragHelper.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Drag/drop helper class.
 *
 * @example
 * var dragHelper = new tinymce.ui.DragHelper('mydiv', {
 *     start: function(evt) {
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
define(
  'tinymce.core.ui.DragHelper',
  [
    "tinymce.core.dom.DomQuery"
  ],
  function ($) {
    "use strict";

    function getDocumentSize(doc) {
      var documentElement, body, scrollWidth, clientWidth;
      var offsetWidth, scrollHeight, clientHeight, offsetHeight, max = Math.max;

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
      var keys, i;

      if (e.changedTouches) {
        keys = "screenX screenY pageX pageY clientX clientY".split(' ');
        for (i = 0; i < keys.length; i++) {
          e[keys[i]] = e.changedTouches[0][keys[i]];
        }
      }
    }

    return function (id, settings) {
      var $eventOverlay, doc = settings.document || document, downButton, start, stop, drag, startX, startY;

      settings = settings || {};

      function getHandleElm() {
        return doc.getElementById(settings.handle || id);
      }

      start = function (e) {
        var docSize = getDocumentSize(doc), handleElm, cursor;

        updateWithTouchData(e);

        e.preventDefault();
        downButton = e.button;
        handleElm = getHandleElm();
        startX = e.screenX;
        startY = e.screenY;

        // Grab cursor from handle so we can place it on overlay
        if (window.getComputedStyle) {
          cursor = window.getComputedStyle(handleElm, null).getPropertyValue("cursor");
        } else {
          cursor = handleElm.runtimeStyle.cursor;
        }

        $eventOverlay = $('<div></div>').css({
          position: "absolute",
          top: 0, left: 0,
          width: docSize.width,
          height: docSize.height,
          zIndex: 0x7FFFFFFF,
          opacity: 0.0001,
          cursor: cursor
        }).appendTo(doc.body);

        $(doc).on('mousemove touchmove', drag).on('mouseup touchend', stop);

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

        $(doc).off('mousemove touchmove', drag).off('mouseup touchend', stop);

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
        $(getHandleElm()).off();
      };

      $(getHandleElm()).on('mousedown touchstart', start);
    };
  }
);