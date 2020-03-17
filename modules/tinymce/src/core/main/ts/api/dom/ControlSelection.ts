/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { document, Element, Event, Node } from '@ephox/dom-globals';
import { Element as SugarElement, Selectors } from '@ephox/sugar';
import * as NodeType from '../../dom/NodeType';
import * as RangePoint from '../../dom/RangePoint';
import Editor from '../Editor';
import Env from '../Env';
import * as Events from '../Events';
import * as Settings from '../Settings';
import Delay from '../util/Delay';
import Tools from '../util/Tools';
import VK from '../util/VK';
import Selection from './Selection';

interface ControlSelection {
  isResizable (elm: Element): boolean;
  showResizeRect (elm: Element): void;
  hideResizeRect (): void;
  updateResizeRect (evt: Event): void;
  destroy (): void;
}

/**
 * This class handles control selection of elements. Controls are elements
 * that can be resized and needs to be selected as a whole. It adds custom resize handles
 * to all browser engines that support properly disabling the built in resize logic.
 *
 * @class tinymce.dom.ControlSelection
 */

const isContentEditableFalse = NodeType.isContentEditableFalse;
const isContentEditableTrue = NodeType.isContentEditableTrue;

const getContentEditableRoot = function (root: Node, node: Node) {
  while (node && node !== root) {
    if (isContentEditableTrue(node) || isContentEditableFalse(node)) {
      return node;
    }

    node = node.parentNode;
  }

  return null;
};

const ControlSelection = (selection: Selection, editor: Editor): ControlSelection => {
  const dom = editor.dom; const each = Tools.each;
  let selectedElm; let selectedElmGhost; let resizeHelper; let resizeHandles; let selectedHandle;
  let startX; let startY; let selectedElmX; let selectedElmY; let startW; let startH; let ratio; let resizeStarted;
  let width;
  let height;
  const editableDoc = editor.getDoc();
  const rootDocument = document;
  const abs = Math.abs;
  const round = Math.round;
  const rootElement = editor.getBody();
  let startScrollWidth;
  let startScrollHeight;

  // Details about each resize handle how to scale etc
  resizeHandles = {
    // Name: x multiplier, y multiplier, delta size x, delta size y
    nw: [ 0, 0, -1, -1 ],
    ne: [ 1, 0, 1, -1 ],
    se: [ 1, 1, 1, 1 ],
    sw: [ 0, 1, -1, 1 ]
  };

  const isImage = function (elm) {
    return elm && (elm.nodeName === 'IMG' || editor.dom.is(elm, 'figure.image'));
  };

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

  const getResizeTarget = function (elm) {
    return editor.dom.is(elm, 'figure.image') ? elm.querySelector('img') : elm;
  };

  const isResizable = function (elm) {
    let selector = Settings.getObjectResizing(editor);

    if (selector === false || Env.iOS) {
      return false;
    }

    if (typeof selector !== 'string') {
      selector = 'table,img,figure.image,div';
    }

    if (elm.getAttribute('data-mce-resize') === 'false') {
      return false;
    }

    if (elm === editor.getBody()) {
      return false;
    }

    return Selectors.is(SugarElement.fromDom(elm), selector);
  };

  const resizeGhostElement = function (e) {
    let deltaX; let deltaY; let proportional;
    let resizeHelperX; let resizeHelperY;

    // Calc new width/height
    deltaX = e.screenX - startX;
    deltaY = e.screenY - startY;

    // Calc new size
    width = deltaX * selectedHandle[2] + startW;
    height = deltaY * selectedHandle[3] + startH;

    // Never scale down lower than 5 pixels
    width = width < 5 ? 5 : width;
    height = height < 5 ? 5 : height;

    if (isImage(selectedElm) && Settings.getResizeImgProportional(editor) !== false) {
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
    dom.setStyles(getResizeTarget(selectedElmGhost), {
      width,
      height
    });

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
      Events.fireObjectResizeStart(editor, selectedElm, startW, startH);
      resizeStarted = true;
    }
  };

  const endGhostResize = function () {
    resizeStarted = false;

    const setSizeProp = function (name, value) {
      if (value) {
        // Resize by using style or attribute
        if (selectedElm.style[name] || !editor.schema.isValid(selectedElm.nodeName.toLowerCase(), name)) {
          dom.setStyle(getResizeTarget(selectedElm), name, value);
        } else {
          dom.setAttrib(getResizeTarget(selectedElm), name, value);
        }
      }
    };

    // Set width/height properties
    setSizeProp('width', width);
    setSizeProp('height', height);

    dom.unbind(editableDoc, 'mousemove', resizeGhostElement);
    dom.unbind(editableDoc, 'mouseup', endGhostResize);

    if (rootDocument !== editableDoc) {
      dom.unbind(rootDocument, 'mousemove', resizeGhostElement);
      dom.unbind(rootDocument, 'mouseup', endGhostResize);
    }

    // Remove ghost/helper and update resize handle positions
    dom.remove(selectedElmGhost);
    dom.remove(resizeHelper);

    showResizeRect(selectedElm);

    Events.fireObjectResized(editor, selectedElm, width, height);
    dom.setAttrib(selectedElm, 'style', dom.getAttrib(selectedElm, 'style'));
    editor.nodeChanged();
  };

  const showResizeRect = function (targetElm) {
    let position; let targetWidth; let targetHeight; let e; let rect;

    hideResizeRect();
    unbindResizeHandleEvents();

    // Get position and size of target
    position = dom.getPos(targetElm, rootElement);
    selectedElmX = position.x;
    selectedElmY = position.y;
    rect = targetElm.getBoundingClientRect(); // Fix for Gecko offsetHeight for table with caption
    targetWidth = rect.width || (rect.right - rect.left);
    targetHeight = rect.height || (rect.bottom - rect.top);

    // Reset width/height if user selects a new image/table
    if (selectedElm !== targetElm) {
      selectedElm = targetElm;
      width = height = 0;
    }

    // Makes it possible to disable resizing
    e = editor.fire('ObjectSelected', { target: targetElm });

    if (isResizable(targetElm) && !e.isDefaultPrevented()) {
      each(resizeHandles, function (handle, name) {
        let handleElm;

        const startDrag = function (e) {
          startX = e.screenX;
          startY = e.screenY;
          startW = getResizeTarget(selectedElm).clientWidth;
          startH = getResizeTarget(selectedElm).clientHeight;
          ratio = startH / startW;
          selectedHandle = handle;

          handle.startPos = {
            x: targetWidth * handle[0] + selectedElmX,
            y: targetHeight * handle[1] + selectedElmY
          };

          startScrollWidth = rootElement.scrollWidth;
          startScrollHeight = rootElement.scrollHeight;

          selectedElmGhost = selectedElm.cloneNode(true);
          dom.addClass(selectedElmGhost, 'mce-clonedresizable');
          dom.setAttrib(selectedElmGhost, 'data-mce-bogus', 'all');
          selectedElmGhost.contentEditable = false; // Hides IE move layer cursor
          selectedElmGhost.unSelectabe = true;
          dom.setStyles(selectedElmGhost, {
            left: selectedElmX,
            top: selectedElmY,
            margin: 0
          });

          selectedElmGhost.removeAttribute('data-mce-selected');
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

        dom.bind(handleElm, 'mousedown', function (e) {
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

    selectedElm.setAttribute('data-mce-selected', '1');
  };

  const hideResizeRect = function () {
    let name; let handleElm;

    unbindResizeHandleEvents();

    if (selectedElm) {
      selectedElm.removeAttribute('data-mce-selected');
    }

    for (name in resizeHandles) {
      handleElm = dom.get('mceResizeHandle' + name);
      if (handleElm) {
        dom.unbind(handleElm);
        dom.remove(handleElm);
      }
    }
  };

  const updateResizeRect = function (e) {
    let startElm; let controlElm;

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
      img.removeAttribute('data-mce-selected');
    });

    controlElm = e.type === 'mousedown' ? e.target : selection.getNode();
    controlElm = dom.$(controlElm).closest('table,img,figure.image,hr')[0];

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
    return isContentEditableFalse(getContentEditableRoot(editor.getBody(), elm));
  };

  const unbindResizeHandleEvents = function () {
    for (const name in resizeHandles) {
      const handle = resizeHandles[name];

      if (handle.elm) {
        dom.unbind(handle.elm);
        delete handle.elm;
      }
    }
  };

  const disableGeckoResize = function () {
    try {
      // Disable object resizing on Gecko
      editor.getDoc().execCommand('enableObjectResizing', false, false);
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
        const target = e.target; const nodeName = target.nodeName;

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

        if (isWithinContentEditableFalse(e.target)) {
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
    selectedElm = selectedElmGhost = null;
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
