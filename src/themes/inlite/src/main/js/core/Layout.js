/**
 * Layout.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.themes.inlite.core.Layout',
  [
    'tinymce.core.geom.Rect',
    'tinymce.themes.inlite.core.Convert'
  ],
  function (Rect, Convert) {
    var result = function (rect, position) {
      return {
        rect: rect,
        position: position
      };
    };

    var moveTo = function (rect, toRect) {
      return { x: toRect.x, y: toRect.y, w: rect.w, h: rect.h };
    };

    var calcByPositions = function (testPositions1, testPositions2, targetRect, contentAreaRect, panelRect) {
      var relPos, relRect, outputPanelRect;

      relPos = Rect.findBestRelativePosition(panelRect, targetRect, contentAreaRect, testPositions1);
      targetRect = Rect.clamp(targetRect, contentAreaRect);

      if (relPos) {
        relRect = Rect.relativePosition(panelRect, targetRect, relPos);
        outputPanelRect = moveTo(panelRect, relRect);
        return result(outputPanelRect, relPos);
      }

      targetRect = Rect.intersect(contentAreaRect, targetRect);
      if (targetRect) {
        relPos = Rect.findBestRelativePosition(panelRect, targetRect, contentAreaRect, testPositions2);
        if (relPos) {
          relRect = Rect.relativePosition(panelRect, targetRect, relPos);
          outputPanelRect = moveTo(panelRect, relRect);
          return result(outputPanelRect, relPos);
        }

        outputPanelRect = moveTo(panelRect, targetRect);
        return result(outputPanelRect, relPos);
      }

      return null;
    };

    var calcInsert = function (targetRect, contentAreaRect, panelRect) {
      return calcByPositions(
        ['cr-cl', 'cl-cr'],
        ['bc-tc', 'bl-tl', 'br-tr'],
        targetRect,
        contentAreaRect,
        panelRect
      );
    };

    var calc = function (targetRect, contentAreaRect, panelRect) {
      return calcByPositions(
        ['tc-bc', 'bc-tc', 'tl-bl', 'bl-tl', 'tr-br', 'br-tr'],
        ['bc-tc', 'bl-tl', 'br-tr'],
        targetRect,
        contentAreaRect,
        panelRect
      );
    };

    var userConstrain = function (handler, targetRect, contentAreaRect, panelRect) {
      var userConstrainedPanelRect;

      if (typeof handler === 'function') {
        userConstrainedPanelRect = handler({
          elementRect: Convert.toClientRect(targetRect),
          contentAreaRect: Convert.toClientRect(contentAreaRect),
          panelRect: Convert.toClientRect(panelRect)
        });

        return Convert.fromClientRect(userConstrainedPanelRect);
      }

      return panelRect;
    };

    var defaultHandler = function (rects) {
      return rects.panelRect;
    };

    return {
      calcInsert: calcInsert,
      calc: calc,
      userConstrain: userConstrain,
      defaultHandler: defaultHandler
    };
  }
);
