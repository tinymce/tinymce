/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import {
  Attribute, Classes, Css, DomEvent, EventArgs, EventUnbinder, Insert, SelectorFilter, SelectorFind, SugarElement, SugarShadowDom
} from '@ephox/sugar';

import Rect, { GeomRect } from 'tinymce/core/api/geom/Rect';
import Observable from 'tinymce/core/api/util/Observable';
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

interface Handle {
  readonly name: string;
  readonly xMul: -1 | 0 | 1;
  readonly yMul: -1 | 0 | 1;
  readonly deltaX: -1 | 0 | 1;
  readonly deltaY: -1 | 0 | 1;
  readonly deltaW: -1 | 0 | 1;
  readonly deltaH: -1 | 0 | 1;
  readonly label: string;
}

const create = (currentRect: GeomRect, viewPortRect: GeomRect, clampRect: GeomRect, containerElm: HTMLElement, action: () => void): CropRect => {
  let dragHelpers: any[];
  let events: EventUnbinder[] = [];
  const prefix = 'tox-';
  const id = prefix + 'crid-' + count++;
  const container = SugarElement.fromDom(containerElm);

  const handles: Handle[] = [
    { name: 'move', xMul: 0, yMul: 0, deltaX: 1, deltaY: 1, deltaW: 0, deltaH: 0, label: 'Crop Mask' },
    { name: 'nw', xMul: 0, yMul: 0, deltaX: 1, deltaY: 1, deltaW: -1, deltaH: -1, label: 'Top Left Crop Handle' },
    { name: 'ne', xMul: 1, yMul: 0, deltaX: 0, deltaY: 1, deltaW: 1, deltaH: -1, label: 'Top Right Crop Handle' },
    { name: 'sw', xMul: 0, yMul: 1, deltaX: 1, deltaY: 0, deltaW: -1, deltaH: 1, label: 'Bottom Left Crop Handle' },
    { name: 'se', xMul: 1, yMul: 1, deltaX: 0, deltaY: 0, deltaW: 1, deltaH: 1, label: 'Bottom Right Crop Handle' }
  ];

  const blockers = [ 'top', 'right', 'bottom', 'left' ];

  const getAbsoluteRect = (outerRect: GeomRect, relativeRect: GeomRect): GeomRect => ({
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

  const moveRect = (handle: Handle, startRect: GeomRect, deltaX: number, deltaY: number) => {
    const x = startRect.x + deltaX * handle.deltaX;
    const y = startRect.y + deltaY * handle.deltaY;
    const w = Math.max(20, startRect.w + deltaX * handle.deltaW);
    const h = Math.max(20, startRect.h + deltaY * handle.deltaH);

    let rect = currentRect = Rect.clamp({ x, y, w, h }, clampRect, handle.name === 'move');
    rect = getRelativeRect(clampRect, rect);

    instance.fire('updateRect', { rect });
    setInnerRect(rect);
  };

  const render = () => {
    const createDragHelper = (handle: Handle) => {
      let startRect: GeomRect;
      return DragHelper(id, {
        document: containerElm.ownerDocument,
        root: SugarShadowDom.getRootNode(container).dom,
        handle: id + '-' + handle.name,

        start: () => {
          startRect = currentRect;
        },

        drag: (e) => {
          moveRect(handle, startRect, e.deltaX, e.deltaY);
        }
      });
    };

    const cropContainer = SugarElement.fromTag('div');
    Attribute.setAll(cropContainer, {
      id,
      'class': prefix + 'croprect-container',
      'role': 'grid',
      'aria-dropeffect': 'execute'
    });
    Insert.append(container, cropContainer);

    Arr.each(blockers, (blocker) => {
      SelectorFind.descendant(container, '#' + id).each((blockerElm) => {
        const cropBlocker = SugarElement.fromTag('div');
        Attribute.setAll(cropBlocker, {
          'id': id + '-' + blocker,
          'class': prefix + 'croprect-block',
          'data-mce-bogus': 'all'
        });
        Css.set(cropBlocker, 'display', 'none');
        Insert.append(blockerElm, cropBlocker);
      });
    });

    Arr.each(handles, (handle) => {
      SelectorFind.descendant(container, '#' + id).each((handleElm) => {
        const cropHandle = SugarElement.fromTag('div');
        Attribute.setAll(cropHandle, {
          'id': id + '-' + handle.name,
          'aria-label': handle.label,
          'aria-grabbed': 'false',
          'data-mce-bogus': 'all',
          'role': 'gridcell',
          'tabindex': '-1',
          'title': handle.label // TODO: tooltips AP-213
        });
        Classes.add(cropHandle, [ prefix + 'croprect-handle', prefix + 'croprect-handle-' + handle.name ]);
        Css.set(cropHandle, 'display', 'none');
        Insert.append(handleElm, cropHandle);
      });
    });

    dragHelpers = Arr.map(handles, createDragHelper);

    repaint(currentRect);

    const handleFocus = (e: EventArgs<FocusEvent>) => {
      Attribute.set(e.target, 'aria-grabbed', e.raw.type === 'focus' ? 'true' : 'false');
    };

    const handleKeydown = (e: EventArgs<KeyboardEvent>) => {
      let activeHandle: Handle;

      Arr.each(handles, (handle) => {
        if (Attribute.get(e.target, 'id') === id + '-' + handle.name) {
          activeHandle = handle;
          return false;
        }
      });

      const moveAndBlock = (evt, handle, startRect, deltaX, deltaY) => {
        evt.stopPropagation();
        evt.preventDefault();

        moveRect(activeHandle, startRect, deltaX, deltaY);
      };

      switch (e.raw.keyCode) {
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
          e.prevent();
          action();
          break;
      }
    };

    events.push(
      DomEvent.bind(container, 'focusin', handleFocus),
      DomEvent.bind(container, 'focusout', handleFocus),
      DomEvent.bind(container, 'keydown', handleKeydown)
    );
  };

  const toggleVisibility = (state: boolean) => {
    const selectors = [
      ...Arr.map(handles, (handle) => '#' + id + '-' + handle.name),
      ...Arr.map(blockers, (blocker) => '#' + id + '-' + blocker)
    ].join(',');

    const elems = SelectorFilter.descendants(container, selectors);
    if (state) {
      Arr.each(elems, (elm) => Css.remove(elm, 'display'));
    } else {
      Arr.each(elems, (elm) => Css.set(elm, 'display', 'none'));
    }
  };

  const repaint = (rect: GeomRect) => {
    const updateElementRect = (name: string, newRect: GeomRect) => {
      SelectorFind.descendant(container, '#' + id + '-' + name).each((elm) => {
        Css.setAll(elm, {
          left: newRect.x + 'px',
          top: newRect.y + 'px',
          width: Math.max(0, newRect.w) + 'px',
          height: Math.max(0, newRect.h) + 'px'
        });
      });
    };

    Arr.each(handles, (handle) => {
      SelectorFind.descendant(container, '#' + id + '-' + handle.name).each((elm) => {
        Css.setAll(elm, {
          left: (rect.w * handle.xMul + rect.x) + 'px',
          top: (rect.h * handle.yMul + rect.y) + 'px'
        });
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
    Arr.each(dragHelpers, (helper) => helper.destroy());
    dragHelpers = [];

    Arr.each(events, (e) => e.unbind());
    events = [];
  };

  render();

  const instance = {
    ...Observable,
    toggleVisibility,
    setClampRect,
    setRect,
    getInnerRect,
    setInnerRect,
    setViewPortRect,
    destroy
  };

  return instance;
};

export const CropRect = {
  create
};
