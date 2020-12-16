/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Rect, { GeomRect } from 'tinymce/core/api/geom/Rect';
import Observable from 'tinymce/core/api/util/Observable';
import Tools from 'tinymce/core/api/util/Tools';
import VK from 'tinymce/core/api/util/VK';

import DragHelper from './DragHelper';

let count = 0;

export interface CropRect extends Observable<any> {
  toggleVisibility: (state: boolean) => void;
  setClampRect: (rect: GeomRect) => void;
  setRect: (rect: GeomRect) => void;
  getInnerRect: (rect: GeomRect) => void;
  setInnerRect: (rect: GeomRect) => void;
  setViewPortRect: (rect: GeomRect) => void;
  destroy: () => void;
}

const create = (currentRect, viewPortRect, clampRect, containerElm, action): CropRect => {
  let dragHelpers: any[];
  const prefix = 'tox-';
  const id = prefix + 'crid-' + count++;

  const handles = [
    { name: 'move', xMul: 0, yMul: 0, deltaX: 1, deltaY: 1, deltaW: 0, deltaH: 0, label: 'Crop Mask' },
    { name: 'nw', xMul: 0, yMul: 0, deltaX: 1, deltaY: 1, deltaW: -1, deltaH: -1, label: 'Top Left Crop Handle' },
    { name: 'ne', xMul: 1, yMul: 0, deltaX: 0, deltaY: 1, deltaW: 1, deltaH: -1, label: 'Top Right Crop Handle' },
    { name: 'sw', xMul: 0, yMul: 1, deltaX: 1, deltaY: 0, deltaW: -1, deltaH: 1, label: 'Bottom Left Crop Handle' },
    { name: 'se', xMul: 1, yMul: 1, deltaX: 0, deltaY: 0, deltaW: 1, deltaH: 1, label: 'Bottom Right Crop Handle' }
  ];

  const blockers = [ 'top', 'right', 'bottom', 'left' ];

  const getAbsoluteRect = (outerRect, relativeRect) => ({
    x: relativeRect.x + outerRect.x,
    y: relativeRect.y + outerRect.y,
    w: relativeRect.w,
    h: relativeRect.h
  });

  const getRelativeRect = (outerRect: GeomRect, innerRect: GeomRect): GeomRect => ({
    x: innerRect.x - outerRect.x,
    y: innerRect.y - outerRect.y,
    w: innerRect.w,
    h: innerRect.h
  });

  const getInnerRect = () => getRelativeRect(clampRect, currentRect);

  const moveRect = (handle, startRect, deltaX, deltaY) => {
    let x, y, w, h, rect;

    x = startRect.x;
    y = startRect.y;
    w = startRect.w;
    h = startRect.h;

    x += deltaX * handle.deltaX;
    y += deltaY * handle.deltaY;
    w += deltaX * handle.deltaW;
    h += deltaY * handle.deltaH;

    if (w < 20) {
      w = 20;
    }

    if (h < 20) {
      h = 20;
    }

    rect = currentRect = Rect.clamp({ x, y, w, h }, clampRect, handle.name === 'move');
    rect = getRelativeRect(clampRect, rect);

    instance.fire('updateRect', { rect });
    setInnerRect(rect);
  };

  const render = () => {
    const createDragHelper = (handle) => {
      let startRect;
      return DragHelper(id, {
        document: containerElm.ownerDocument,
        handle: id + '-' + handle.name,

        start: () => {
          startRect = currentRect;
        },

        drag: (e) => {
          moveRect(handle, startRect, e.deltaX, e.deltaY);
        }
      });
    };

    DomQuery(
      '<div id="' + id + '" class="' + prefix + 'croprect-container"' +
      ' role="grid" aria-dropeffect="execute">'
    ).appendTo(containerElm);

    Tools.each(blockers, (blocker) => {
      DomQuery('#' + id, containerElm).append(
        '<div id="' + id + '-' + blocker + '"class="' + prefix + 'croprect-block" style="display: none" data-mce-bogus="all">'
      );
    });

    Tools.each(handles, (handle) => {
      DomQuery('#' + id, containerElm).append(
        '<div id="' + id + '-' + handle.name + '" class="' + prefix +
        'croprect-handle ' + prefix + 'croprect-handle-' + handle.name + '"' +
        'style="display: none" data-mce-bogus="all" role="gridcell" tabindex="-1"' +
        ' aria-label="' + handle.label + '" aria-grabbed="false" title="' + handle.label + '">' // TODO: tooltips AP-213
      );
    });

    dragHelpers = Tools.map(handles, createDragHelper);

    repaint(currentRect);

    DomQuery(containerElm).on('focusin focusout', (e) => {
      DomQuery(e.target).attr('aria-grabbed', e.type === 'focus' ? 'true' : 'false');
    });

    DomQuery(containerElm).on('keydown', (e) => {
      let activeHandle;

      Tools.each(handles, (handle) => {
        if (e.target.id === id + '-' + handle.name) {
          activeHandle = handle;
          return false;
        }
      });

      const moveAndBlock = (evt, handle, startRect, deltaX, deltaY) => {
        evt.stopPropagation();
        evt.preventDefault();

        moveRect(activeHandle, startRect, deltaX, deltaY);
      };

      switch (e.keyCode) {
        case VK.LEFT:
          moveAndBlock(e, activeHandle, currentRect, -10, 0);
          break;

        case VK.RIGHT:
          moveAndBlock(e, activeHandle, currentRect, 10, 0);
          break;

        case VK.UP:
          moveAndBlock(e, activeHandle, currentRect, 0, -10);
          break;

        case VK.DOWN:
          moveAndBlock(e, activeHandle, currentRect, 0, 10);
          break;

        case VK.ENTER:
        case VK.SPACEBAR:
          e.preventDefault();
          action();
          break;
      }
    });
  };

  const toggleVisibility = (state: boolean) => {
    const selectors = Tools.map(handles, (handle) => {
      return '#' + id + '-' + handle.name;
    }).concat(Tools.map(blockers, (blocker) => {
      return '#' + id + '-' + blocker;
    })).join(',');

    if (state) {
      DomQuery(selectors, containerElm).show();
    } else {
      DomQuery(selectors, containerElm).hide();
    }
  };

  const repaint = (rect) => {
    const updateElementRect = (name, rect) => {
      if (rect.h < 0) {
        rect.h = 0;
      }

      if (rect.w < 0) {
        rect.w = 0;
      }

      DomQuery('#' + id + '-' + name, containerElm).css({
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h
      });
    };

    Tools.each(handles, (handle) => {
      DomQuery('#' + id + '-' + handle.name, containerElm).css({
        left: rect.w * handle.xMul + rect.x,
        top: rect.h * handle.yMul + rect.y
      });
    });

    updateElementRect('top', { x: viewPortRect.x, y: viewPortRect.y, w: viewPortRect.w, h: rect.y - viewPortRect.y });
    updateElementRect('right', { x: rect.x + rect.w, y: rect.y, w: viewPortRect.w - rect.x - rect.w + viewPortRect.x, h: rect.h });
    updateElementRect('bottom', {
      x: viewPortRect.x,
      y: rect.y + rect.h,
      w: viewPortRect.w,
      h: viewPortRect.h - rect.y - rect.h + viewPortRect.y
    });
    updateElementRect('left', { x: viewPortRect.x, y: rect.y, w: rect.x - viewPortRect.x, h: rect.h });
    updateElementRect('move', rect);
  };

  const setRect = (rect: GeomRect): void => {
    currentRect = rect;
    repaint(currentRect);
  };

  const setViewPortRect = (rect: GeomRect): void => {
    viewPortRect = rect;
    repaint(currentRect);
  };

  const setInnerRect = (rect: GeomRect): void => {
    setRect(getAbsoluteRect(clampRect, rect));
  };

  const setClampRect = (rect: GeomRect): void => {
    clampRect = rect;
    repaint(currentRect);
  };

  const destroy = () => {
    Tools.each(dragHelpers, (helper) => {
      helper.destroy();
    });

    dragHelpers = [];
  };

  render();

  const instance = Tools.extend({
    toggleVisibility,
    setClampRect,
    setRect,
    getInnerRect,
    setInnerRect,
    setViewPortRect,
    destroy
  }, Observable);

  return instance;
};

export const CropRect = {
  create
};
