/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Rect, { GeomRect } from 'tinymce/core/api/geom/Rect';
import Convert from './Convert';

const result = function (rect, position) {
  return {
    rect,
    position
  };
};

const moveTo = function (rect: GeomRect, toRect: GeomRect) {
  return { x: toRect.x, y: toRect.y, w: rect.w, h: rect.h };
};

const calcByPositions = function (testPositions1: string[], testPositions2: string[], targetRect: GeomRect, contentAreaRect: GeomRect, panelRect: GeomRect) {
  let relPos, relRect, outputPanelRect;

  const paddedContentRect = {
    x: contentAreaRect.x,
    y: contentAreaRect.y,
    w: contentAreaRect.w + (contentAreaRect.w < (panelRect.w + targetRect.w) ? panelRect.w : 0),
    h: contentAreaRect.h + (contentAreaRect.h < (panelRect.h + targetRect.h) ? panelRect.h : 0)
  };

  relPos = Rect.findBestRelativePosition(panelRect, targetRect, paddedContentRect, testPositions1);
  targetRect = Rect.clamp(targetRect, paddedContentRect);

  if (relPos) {
    relRect = Rect.relativePosition(panelRect, targetRect, relPos);
    outputPanelRect = moveTo(panelRect, relRect);
    return result(outputPanelRect, relPos);
  }

  targetRect = Rect.intersect(paddedContentRect, targetRect);
  if (targetRect) {
    relPos = Rect.findBestRelativePosition(panelRect, targetRect, paddedContentRect, testPositions2);

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

const calcInsert = function (targetRect: GeomRect, contentAreaRect: GeomRect, panelRect: GeomRect) {
  return calcByPositions(
    ['cr-cl', 'cl-cr'],
    ['bc-tc', 'bl-tl', 'br-tr'],
    targetRect,
    contentAreaRect,
    panelRect
  );
};

const calc = function (targetRect: GeomRect, contentAreaRect: GeomRect, panelRect: GeomRect) {
  return calcByPositions(
    ['tc-bc', 'bc-tc', 'tl-bl', 'bl-tl', 'tr-br', 'br-tr', 'cr-cl', 'cl-cr'],
    ['bc-tc', 'bl-tl', 'br-tr', 'cr-cl'],
    targetRect,
    contentAreaRect,
    panelRect
  );
};

const userConstrain = function (handler, targetRect: GeomRect, contentAreaRect: GeomRect, panelRect: GeomRect) {
  let userConstrainedPanelRect;

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

const defaultHandler = function (rects) {
  return rects.panelRect;
};

export default {
  calcInsert,
  calc,
  userConstrain,
  defaultHandler
};