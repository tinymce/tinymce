/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Obj, Type } from '@ephox/katamari';
import { Selectors, SugarElement } from '@ephox/sugar';
import * as CefUtils from '../../dom/CefUtils';
import * as NodeType from '../../dom/NodeType';
import * as RangePoint from '../../dom/RangePoint';
import Editor from '../Editor';
import Env from '../Env';
import * as Events from '../Events';
import * as Settings from '../Settings';
import Delay from '../util/Delay';
import { EditorEvent } from '../util/EventDispatcher';
import Tools from '../util/Tools';
import VK from '../util/VK';
import EditorSelection from './Selection';

interface ControlSelection {
  isResizable (elm: Element): boolean;
  showResizeRect (elm: Element): void;
  hideResizeRect (): void;
  updateResizeRect (evt: EditorEvent<any>): void;
  destroy (): void;
}

type ResizeHandle = [ number, number, number, number ] & { elm?: Element };

type ResizeHandles = {
  ne: ResizeHandle;
  nw: ResizeHandle;
  se: ResizeHandle;
  sw: ResizeHandle;
};

interface SelectedResizeHandle extends ResizeHandle {
  elm: Element;
  name: string;
  startPos: {
    x: number;
    y: number;
  };
}

/**
 * This class handles control selection of elements. Controls are elements
 * that can be resized and needs to be selected as a whole. It adds custom resize handles
 * to all browser engines that support properly disabling the built in resize logic.
 *
 * @private
 * @class tinymce.dom.ControlSelection
 */

const isContentEditableFalse = NodeType.isContentEditableFalse;

const ControlSelection = (selection: EditorSelection, editor: Editor): ControlSelection => {
  const elementSelectionAttr = 'data-mce-selected';
  const dom = editor.dom, each = Tools.each;
  let selectedElm, selectedElmGhost: HTMLElement, resizeHelper, selectedHandle: SelectedResizeHandle, resizeBackdrop: HTMLElement;
  let startX, startY, selectedElmX, selectedElmY, startW, startH, ratio, resizeStarted;
  let width,
    height;
  const editableDoc = editor.getDoc(),
    rootDocument = document;
  const abs = Math.abs,
    round = Math.round,
    rootElement = editor.getBody();
  let startScrollWidth,
    startScrollHeight;

  // Details about each resize handle how to scale etc
  const resizeHandles: ResizeHandles = {
    // Name: x multiplier, y multiplier, delta size x, delta size y
    nw: [ 0, 0, -1, -1 ],
    ne: [ 1, 0, 1, -1 ],
    se: [ 1, 1, 1, 1 ],
    sw: [ 0, 1, -1, 1 ]
  };

  const isImage = function (elm) {
    return elm && (elm.nodeName === 'IMG' || editor.dom.is(elm, 'figure.image'));
  };

  const isMedia = (elm: Element) => NodeType.isMedia(elm) || dom.hasClass(elm, 'mce-preview-object');

  const isEventOnImageOutsideRange = function (evt, range) {
    if (evt.type === 'longpress' || evt.type.indexOf('touch') === 0) {
      const touch = evt.touches[0];
      return isImage(evt.target) && !RangePoint.isXYWithinRange(touch.clientX, touch.clientY, range);
    } else {
      return isImage(evt.target) && !RangePoint.isXYWithinRange(evt.clientX, evt.clientY, range);
    }
  };

  const contextMenuSelectImage = function (evt) {
    const target = evt.target;

    if (isEventOnImageOutsideRange(evt, editor.selection.getRng()) && !evt.isDefaultPrevented()) {
      editor.selection.select(target);
    }
  };

  const getResizeTarget = (elm: HTMLElement): HTMLElement => {
    if (dom.is(elm, 'figure.image')) {
      return elm.querySelector('img');
    } else if (dom.hasClass(elm, 'mce-preview-object') && Type.isNonNullable(elm.firstElementChild)) {
      return elm.firstElementChild as HTMLElement;
    } else {
      return elm;
    }
  };

  const isResizable = (elm: Element) => {
    const selector = Settings.getObjectResizing(editor);

    if (!selector) {
      return false;
    }

    if (elm.getAttribute('data-mce-resize') === 'false') {
      return false;
    }

    if (elm === editor.getBody()) {
      return false;
    }

    if (dom.hasClass(elm, 'mce-preview-object')) {
      return Selectors.is(SugarElement.fromDom(elm.firstElementChild), selector);
    } else {
      return Selectors.is(SugarElement.fromDom(elm), selector);
    }
  };

  const createGhostElement = (elm: HTMLElement) => {
    if (isMedia(elm)) {
      return dom.create('img', { src: Env.transparentSrc });
    } else {
      return elm.cloneNode(true) as HTMLElement;
    }
  };

  const setGhostElmSize = (ghostElm: HTMLElement, width: number, height: number) => {
    dom.setStyles(getResizeTarget(ghostElm), {
      width,
      height
    });
  };

  const resizeGhostElement = (e: MouseEvent) => {
    let deltaX, deltaY, proportional;
    let resizeHelperX, resizeHelperY;

    // Calc new width/height
    deltaX = e.screenX - startX;
    deltaY = e.screenY - startY;

    // Calc new size
    width = deltaX * selectedHandle[2] + startW;
    height = deltaY * selectedHandle[3] + startH;

    // Never scale down lower than 5 pixels
    width = width < 5 ? 5 : width;
    height = height < 5 ? 5 : height;

    if ((isImage(selectedElm) || isMedia(selectedElm)) && Settings.getResizeImgProportional(editor) !== false) {
      proportional = !VK.modifierPressed(e);
    } else {
      proportional = VK.modifierPressed(e);
    }

    // Constrain proportions
    if (proportional) {
      if (abs(deltaX) > abs(deltaY)) {
        height = round(width * ratio);
        width = round(height / ratio);
      } else {
        width = round(height / ratio);
        height = round(width * ratio);
      }
    }

    // Update ghost size
    setGhostElmSize(selectedElmGhost, width, height);

    // Update resize helper position
    resizeHelperX = selectedHandle.startPos.x + deltaX;
    resizeHelperY = selectedHandle.startPos.y + deltaY;
    resizeHelperX = resizeHelperX > 0 ? resizeHelperX : 0;
    resizeHelperY = resizeHelperY > 0 ? resizeHelperY : 0;

    dom.setStyles(resizeHelper, {
      left: resizeHelperX,
      top: resizeHelperY,
      display: 'block'
    });

    resizeHelper.innerHTML = width + ' &times; ' + height;

    // Update ghost X position if needed
    if (selectedHandle[2] < 0 && selectedElmGhost.clientWidth <= width) {
      dom.setStyle(selectedElmGhost, 'left', selectedElmX + (startW - width));
    }

    // Update ghost Y position if needed
    if (selectedHandle[3] < 0 && selectedElmGhost.clientHeight <= height) {
      dom.setStyle(selectedElmGhost, 'top', selectedElmY + (startH - height));
    }

    // Calculate how must overflow we got
    deltaX = rootElement.scrollWidth - startScrollWidth;
    deltaY = rootElement.scrollHeight - startScrollHeight;

    // Re-position the resize helper based on the overflow
    if (deltaX + deltaY !== 0) {
      dom.setStyles(resizeHelper, {
        left: resizeHelperX - deltaX,
        top: resizeHelperY - deltaY
      });
    }

    if (!resizeStarted) {
      Events.fireObjectResizeStart(editor, selectedElm, startW, startH, 'corner-' + selectedHandle.name);
      resizeStarted = true;
    }
  };

  const endGhostResize = () => {
    const wasResizeStarted = resizeStarted;
    resizeStarted = false;

    const setSizeProp = (name: string, value: number) => {
      if (value) {
        // Resize by using style or attribute
        const target = getResizeTarget(selectedElm);
        if (target.style[name] || !editor.schema.isValid(target.nodeName.toLowerCase(), name)) {
          dom.setStyle(target, name, value);
        } else {
          dom.setAttrib(target, name, '' + value);
        }
      }
    };

    // Set width/height properties
    if (wasResizeStarted) {
      setSizeProp('width', width);
      setSizeProp('height', height);
    }

    dom.unbind(editableDoc, 'mousemove', resizeGhostElement);
    dom.unbind(editableDoc, 'mouseup', endGhostResize);

    if (rootDocument !== editableDoc) {
      dom.unbind(rootDocument, 'mousemove', resizeGhostElement);
      dom.unbind(rootDocument, 'mouseup', endGhostResize);
    }

    // Remove ghost/helper and update resize handle positions
    dom.remove(selectedElmGhost);
    dom.remove(resizeHelper);
    dom.remove(resizeBackdrop);

    showResizeRect(selectedElm);

    if (wasResizeStarted) {
      Events.fireObjectResized(editor, selectedElm, width, height, 'corner-' + selectedHandle.name);
      dom.setAttrib(selectedElm, 'style', dom.getAttrib(selectedElm, 'style'));
    }
    editor.nodeChanged();
  };

  const showResizeRect = (targetElm: HTMLElement) => {
    unbindResizeHandleEvents();

    // Get position and size of target
    const position = dom.getPos(targetElm, rootElement);
    const selectedElmX = position.x;
    const selectedElmY = position.y;
    const rect = targetElm.getBoundingClientRect(); // Fix for Gecko offsetHeight for table with caption
    const targetWidth = rect.width || (rect.right - rect.left);
    const targetHeight = rect.height || (rect.bottom - rect.top);

    // Reset width/height if user selects a new image/table
    if (selectedElm !== targetElm) {
      hideResizeRect();
      selectedElm = targetElm;
      width = height = 0;
    }

    // Makes it possible to disable resizing
    const e = editor.fire('ObjectSelected', { target: targetElm });

    // Store the original data-mce-selected value or fallback to '1' if not set
    const selectedValue = dom.getAttrib(selectedElm, elementSelectionAttr, '1');

    if (isResizable(targetElm) && !e.isDefaultPrevented()) {
      each(resizeHandles, (handle, name) => {
        let handleElm;

        const startDrag = (e: MouseEvent) => {
          startX = e.screenX;
          startY = e.screenY;
          startW = getResizeTarget(selectedElm).clientWidth;
          startH = getResizeTarget(selectedElm).clientHeight;
          ratio = startH / startW;
          selectedHandle = handle as SelectedResizeHandle;

          selectedHandle.name = name;
          selectedHandle.startPos = {
            x: targetWidth * handle[0] + selectedElmX,
            y: targetHeight * handle[1] + selectedElmY
          };

          startScrollWidth = rootElement.scrollWidth;
          startScrollHeight = rootElement.scrollHeight;

          resizeBackdrop = dom.add(rootElement, 'div', { class: 'mce-resize-backdrop' });
          dom.setStyles(resizeBackdrop, {
            position: 'fixed',
            left: '0',
            top: '0',
            width: '100%',
            height: '100%'
          });

          selectedElmGhost = createGhostElement(selectedElm);
          dom.addClass(selectedElmGhost, 'mce-clonedresizable');
          dom.setAttrib(selectedElmGhost, 'data-mce-bogus', 'all');
          selectedElmGhost.contentEditable = 'false'; // Hides IE move layer cursor
          dom.setStyles(selectedElmGhost, {
            left: selectedElmX,
            top: selectedElmY,
            margin: 0
          });

          // Set initial ghost size
          setGhostElmSize(selectedElmGhost, targetWidth, targetHeight);

          selectedElmGhost.removeAttribute(elementSelectionAttr);
          rootElement.appendChild(selectedElmGhost);

          dom.bind(editableDoc, 'mousemove', resizeGhostElement);
          dom.bind(editableDoc, 'mouseup', endGhostResize);

          if (rootDocument !== editableDoc) {
            dom.bind(rootDocument, 'mousemove', resizeGhostElement);
            dom.bind(rootDocument, 'mouseup', endGhostResize);
          }

          resizeHelper = dom.add(rootElement, 'div', {
            'class': 'mce-resize-helper',
            'data-mce-bogus': 'all'
          }, startW + ' &times; ' + startH);
        };

        // Get existing or render resize handle
        handleElm = dom.get('mceResizeHandle' + name);
        if (handleElm) {
          dom.remove(handleElm);
        }

        handleElm = dom.add(rootElement, 'div', {
          'id': 'mceResizeHandle' + name,
          'data-mce-bogus': 'all',
          'class': 'mce-resizehandle',
          'unselectable': true,
          'style': 'cursor:' + name + '-resize; margin:0; padding:0'
        });

        // Hides IE move layer cursor
        // If we set it on Chrome we get this wounderful bug: #6725
        // Edge doesn't have this issue however setting contenteditable will move the selection to that element on Edge 17 see #TINY-1679
        if (Env.ie === 11) {
          handleElm.contentEditable = false;
        }

        dom.bind(handleElm, 'mousedown', (e) => {
          e.stopImmediatePropagation();
          e.preventDefault();
          startDrag(e);
        });

        handle.elm = handleElm;

        // Position element
        dom.setStyles(handleElm, {
          left: (targetWidth * handle[0] + selectedElmX) - (handleElm.offsetWidth / 2),
          top: (targetHeight * handle[1] + selectedElmY) - (handleElm.offsetHeight / 2)
        });
      });
    } else {
      hideResizeRect();
    }

    if (!dom.getAttrib(selectedElm, elementSelectionAttr)) {
      selectedElm.setAttribute(elementSelectionAttr, selectedValue);
    }
  };

  const hideResizeRect = () => {
    unbindResizeHandleEvents();

    if (selectedElm) {
      selectedElm.removeAttribute(elementSelectionAttr);
    }

    Obj.each(resizeHandles, (value, name) => {
      const handleElm = dom.get('mceResizeHandle' + name);
      if (handleElm) {
        dom.unbind(handleElm);
        dom.remove(handleElm);
      }
    });
  };

  const updateResizeRect = function (e) {
    let startElm, controlElm;

    const isChildOrEqual = function (node, parent) {
      if (node) {
        do {
          if (node === parent) {
            return true;
          }
        } while ((node = node.parentNode));
      }
    };

    // Ignore all events while resizing or if the editor instance was removed
    if (resizeStarted || editor.removed) {
      return;
    }

    // Remove data-mce-selected from all elements since they might have been copied using Ctrl+c/v
    each(dom.select('img[data-mce-selected],hr[data-mce-selected]'), function (img) {
      img.removeAttribute(elementSelectionAttr);
    });

    controlElm = e.type === 'mousedown' ? e.target : selection.getNode();
    controlElm = dom.$(controlElm).closest('table,img,figure.image,hr,video,span.mce-preview-object')[0];

    if (isChildOrEqual(controlElm, rootElement)) {
      disableGeckoResize();
      startElm = selection.getStart(true);

      if (isChildOrEqual(startElm, controlElm) && isChildOrEqual(selection.getEnd(true), controlElm)) {
        showResizeRect(controlElm);
        return;
      }
    }

    hideResizeRect();
  };

  const isWithinContentEditableFalse = function (elm) {
    return isContentEditableFalse(CefUtils.getContentEditableRoot(editor.getBody(), elm));
  };

  const unbindResizeHandleEvents = function () {
    Obj.each(resizeHandles, (handle) => {
      if (handle.elm) {
        dom.unbind(handle.elm);
        delete handle.elm;
      }
    });
  };

  const disableGeckoResize = function () {
    try {
      // Disable object resizing on Gecko
      editor.getDoc().execCommand('enableObjectResizing', false, 'false');
    } catch (ex) {
      // Ignore
    }
  };

  editor.on('init', function () {
    disableGeckoResize();

    // Sniff sniff, hard to feature detect this stuff
    if (Env.browser.isIE() || Env.browser.isEdge()) {
      // Needs to be mousedown for drag/drop to work on IE 11
      // Needs to be click on Edge to properly select images
      editor.on('mousedown click', function (e) {
        const target = e.target, nodeName = target.nodeName;

        if (!resizeStarted && /^(TABLE|IMG|HR)$/.test(nodeName) && !isWithinContentEditableFalse(target)) {
          if (e.button !== 2) {
            editor.selection.select(target, nodeName === 'TABLE');
          }

          // Only fire once since nodeChange is expensive
          if (e.type === 'mousedown') {
            editor.nodeChanged();
          }
        }
      });

      const handleMSControlSelect = (e) => {
        const delayedSelect = (node: Node) => {
          Delay.setEditorTimeout(editor, () => editor.selection.select(node));
        };

        if (isWithinContentEditableFalse(e.target) || NodeType.isMedia(e.target)) {
          e.preventDefault();
          delayedSelect(e.target);
          return;
        }

        if (/^(TABLE|IMG|HR)$/.test(e.target.nodeName)) {
          e.preventDefault();

          // This moves the selection from being a control selection to a text like selection like in WebKit #6753
          // TODO: Fix this the day IE works like other browsers without this nasty native ugly control selections.
          if (e.target.tagName === 'IMG') {
            delayedSelect(e.target);
          }
        }
      };

      dom.bind(rootElement, 'mscontrolselect', handleMSControlSelect);
      editor.on('remove', () => dom.unbind(rootElement, 'mscontrolselect', handleMSControlSelect));
    }

    const throttledUpdateResizeRect = Delay.throttle(function (e) {
      if (!editor.composing) {
        updateResizeRect(e);
      }
    });

    editor.on('nodechange ResizeEditor ResizeWindow ResizeContent drop FullscreenStateChanged', throttledUpdateResizeRect);

    // Update resize rect while typing in a table
    editor.on('keyup compositionend', function (e) {
      // Don't update the resize rect while composing since it blows away the IME see: #2710
      if (selectedElm && selectedElm.nodeName === 'TABLE') {
        throttledUpdateResizeRect(e);
      }
    });

    editor.on('hide blur', hideResizeRect);
    editor.on('contextmenu longpress', contextMenuSelectImage, true);

    // Hide rect on focusout since it would float on top of windows otherwise
    // editor.on('focusout', hideResizeRect);
  });

  editor.on('remove', unbindResizeHandleEvents);

  const destroy = function () {
    selectedElm = selectedElmGhost = resizeBackdrop = null;
  };

  return {
    isResizable,
    showResizeRect,
    hideResizeRect,
    updateResizeRect,
    destroy
  };
};

export default ControlSelection;
