import { Arr, Obj, Throttler, Type } from '@ephox/katamari';
import { SelectorFind, Selectors, SugarElement } from '@ephox/sugar';

import * as NodeType from '../../dom/NodeType';
import * as RangePoint from '../../dom/RangePoint';
import Editor from '../Editor';
import Env from '../Env';
import * as Events from '../Events';
import * as Options from '../Options';
import { EditorEvent } from '../util/EventDispatcher';
import Tools from '../util/Tools';
import VK from '../util/VK';
import EditorSelection from './Selection';

interface ControlSelection {
  isResizable: (elm: Element) => boolean;
  showResizeRect: (elm: Element) => void;
  hideResizeRect: () => void;
  updateResizeRect: (evt: EditorEvent<any>) => void;
  destroy: () => void;
}

type ResizeHandle = [ number, number, number, number ] & { elm?: Element };

// Note: Need to use a type here, as types are iterable whereas interfaces are not
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
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

const ControlSelection = (selection: EditorSelection, editor: Editor): ControlSelection => {
  const elementSelectionAttr = 'data-mce-selected';
  const dom = editor.dom, each = Tools.each;
  let selectedElm: HTMLElement, selectedElmGhost: HTMLElement, resizeHelper: HTMLElement, selectedHandle: SelectedResizeHandle, resizeBackdrop: HTMLElement;
  let startX: number, startY: number, selectedElmX: number, selectedElmY: number, startW: number, startH: number, ratio: number, resizeStarted: boolean;
  let width: number,
    height: number;
  const editableDoc = editor.getDoc(),
    rootDocument = document;
  const abs = Math.abs,
    round = Math.round,
    rootElement = editor.getBody();
  let startScrollWidth: number,
    startScrollHeight: number;

  // Details about each resize handle how to scale etc
  const resizeHandles: ResizeHandles = {
    // Name: x multiplier, y multiplier, delta size x, delta size y
    nw: [ 0, 0, -1, -1 ],
    ne: [ 1, 0, 1, -1 ],
    se: [ 1, 1, 1, 1 ],
    sw: [ 0, 1, -1, 1 ]
  };

  const isImage = (elm: Element) =>
    Type.isNonNullable(elm) && (NodeType.isImg(elm) || editor.dom.is(elm, 'figure.image'));

  const isMedia = (elm: Element) =>
    NodeType.isMedia(elm) || dom.hasClass(elm, 'mce-preview-object');

  const isEventOnImageOutsideRange = (evt, range: Range) => {
    if (evt.type === 'longpress' || evt.type.indexOf('touch') === 0) {
      const touch = evt.touches[0];
      return isImage(evt.target) && !RangePoint.isXYWithinRange(touch.clientX, touch.clientY, range);
    } else {
      return isImage(evt.target) && !RangePoint.isXYWithinRange(evt.clientX, evt.clientY, range);
    }
  };

  const contextMenuSelectImage = (evt) => {
    const target = evt.target;

    if (isEventOnImageOutsideRange(evt, editor.selection.getRng()) && !evt.isDefaultPrevented()) {
      editor.selection.select(target);
    }
  };

  const getResizeTargets = (elm: HTMLElement): HTMLElement[] => {
    if (dom.is(elm, 'figure.image')) {
      return [ elm.querySelector('img') ];
    } else if (dom.hasClass(elm, 'mce-preview-object') && Type.isNonNullable(elm.firstElementChild)) {
      // When resizing a preview object we need to resize both the original element and the wrapper span
      return [ elm, elm.firstElementChild as HTMLElement ];
    } else {
      return [ elm ];
    }
  };

  const isResizable = (elm: Element) => {
    const selector = Options.getObjectResizing(editor);

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

  const setSizeProp = (element: HTMLElement, name: string, value: number | undefined) => {
    if (Type.isNonNullable(value)) {
      // Resize by using style or attribute
      const targets = getResizeTargets(element);
      Arr.each(targets, (target) => {
        if (target.style[name] || !editor.schema.isValid(target.nodeName.toLowerCase(), name)) {
          dom.setStyle(target, name, value);
        } else {
          dom.setAttrib(target, name, '' + value);
        }
      });
    }
  };

  const setGhostElmSize = (ghostElm: HTMLElement, width: number, height: number) => {
    setSizeProp(ghostElm, 'width', width);
    setSizeProp(ghostElm, 'height', height);
  };

  const resizeGhostElement = (e: MouseEvent) => {
    let deltaX: number, deltaY: number, proportional: boolean;
    let resizeHelperX: number, resizeHelperY: number;

    // Calc new width/height
    deltaX = e.screenX - startX;
    deltaY = e.screenY - startY;

    // Calc new size
    width = deltaX * selectedHandle[2] + startW;
    height = deltaY * selectedHandle[3] + startH;

    // Never scale down lower than 5 pixels
    width = width < 5 ? 5 : width;
    height = height < 5 ? 5 : height;

    if ((isImage(selectedElm) || isMedia(selectedElm)) && Options.getResizeImgProportional(editor) !== false) {
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

    // Set width/height properties
    if (wasResizeStarted) {
      setSizeProp(selectedElm, 'width', width);
      setSizeProp(selectedElm, 'height', height);
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
    const e = editor.dispatch('ObjectSelected', { target: targetElm });

    // Store the original data-mce-selected value or fallback to '1' if not set
    const selectedValue = dom.getAttrib(selectedElm, elementSelectionAttr, '1');

    if (isResizable(targetElm) && !e.isDefaultPrevented()) {
      each(resizeHandles, (handle, name) => {
        let handleElm;

        const startDrag = (e: MouseEvent) => {
          // Note: We're guaranteed to have at least one target here
          const target = getResizeTargets(selectedElm)[0];
          startX = e.screenX;
          startY = e.screenY;
          startW = target.clientWidth;
          startH = target.clientHeight;
          ratio = startH / startW;
          selectedHandle = handle as SelectedResizeHandle;

          selectedHandle.name = name;
          selectedHandle.startPos = {
            x: targetWidth * handle[0] + selectedElmX,
            y: targetHeight * handle[1] + selectedElmY
          };

          startScrollWidth = rootElement.scrollWidth;
          startScrollHeight = rootElement.scrollHeight;

          resizeBackdrop = dom.add(rootElement, 'div', {
            'class': 'mce-resize-backdrop',
            'data-mce-bogus': 'all'
          });
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

  const updateResizeRect = (e) => {
    let startElm: Element, controlElm: HTMLElement;

    const isChildOrEqual = (node, parent) => {
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
    each(dom.select('img[data-mce-selected],hr[data-mce-selected]'), (img) => {
      img.removeAttribute(elementSelectionAttr);
    });

    controlElm = e.type === 'mousedown' ? e.target : selection.getNode();
    controlElm = SelectorFind.closest<HTMLElement>(SugarElement.fromDom(controlElm), 'table,img,figure.image,hr,video,span.mce-preview-object').getOrUndefined()?.dom;

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

  const unbindResizeHandleEvents = () => {
    Obj.each(resizeHandles, (handle) => {
      if (handle.elm) {
        dom.unbind(handle.elm);
        delete handle.elm;
      }
    });
  };

  const disableGeckoResize = () => {
    try {
      // Disable object resizing on Gecko
      editor.getDoc().execCommand('enableObjectResizing', false, 'false');
    } catch (ex) {
      // Ignore
    }
  };

  editor.on('init', () => {
    disableGeckoResize();

    const throttledUpdateResizeRect = Throttler.first((e) => {
      if (!editor.composing) {
        updateResizeRect(e);
      }
    }, 0);

    editor.on('nodechange ResizeEditor ResizeWindow ResizeContent drop FullscreenStateChanged', throttledUpdateResizeRect.throttle);

    // Update resize rect while typing in a table
    editor.on('keyup compositionend', (e) => {
      // Don't update the resize rect while composing since it blows away the IME see: #2710
      if (selectedElm && selectedElm.nodeName === 'TABLE') {
        throttledUpdateResizeRect.throttle(e);
      }
    });

    editor.on('hide blur', hideResizeRect);
    editor.on('contextmenu longpress', contextMenuSelectImage, true);

    // Hide rect on focusout since it would float on top of windows otherwise
    // editor.on('focusout', hideResizeRect);
  });

  editor.on('remove', unbindResizeHandleEvents);

  const destroy = () => {
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
