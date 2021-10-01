/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Singleton } from '@ephox/katamari';

import DOMUtils from './api/dom/DOMUtils';
import { EventUtilsEvent } from './api/dom/EventUtils';
import EditorSelection from './api/dom/Selection';
import Editor from './api/Editor';
import * as Settings from './api/Settings';
import Delay from './api/util/Delay';
import { EditorEvent } from './api/util/EventDispatcher';
import VK from './api/util/VK';
import * as MousePosition from './dom/MousePosition';
import * as NodeType from './dom/NodeType';
import * as ErrorReporter from './ErrorReporter';
import { isUIElement } from './focus/FocusController';
import * as Predicate from './util/Predicate';

/**
 * This module contains logic overriding the drag/drop logic of the editor.
 *
 * @private
 * @class tinymce.DragDropOverrides
 */

interface State {
  element: HTMLElement;
  dragging: boolean;
  screenX: number;
  screenY: number;
  maxX: number;
  maxY: number;
  relX: number;
  relY: number;
  width: number;
  height: number;
  ghost: HTMLElement;
}

const isContentEditableFalse = NodeType.isContentEditableFalse,
  isContentEditableTrue = NodeType.isContentEditableTrue;

const isDraggable = (rootElm: HTMLElement, elm: HTMLElement) =>
  isContentEditableFalse(elm) && elm !== rootElm;

const isValidDropTarget = (editor: Editor, targetElement: Node, dragElement: Node) => {
  if (targetElement === dragElement || editor.dom.isChildOf(targetElement, dragElement)) {
    return false;
  }

  return !isContentEditableFalse(targetElement);
};

const cloneElement = (elm: HTMLElement) => {
  const cloneElm = elm.cloneNode(true) as HTMLElement;
  cloneElm.removeAttribute('data-mce-selected');
  return cloneElm;
};

const createGhost = (editor: Editor, elm: HTMLElement, width: number, height: number) => {
  const dom = editor.dom;
  const clonedElm = elm.cloneNode(true);

  dom.setStyles(clonedElm, { width, height });
  dom.setAttrib(clonedElm, 'data-mce-selected', null);

  const ghostElm = dom.create('div', {
    'class': 'mce-drag-container',
    'data-mce-bogus': 'all',
    'unselectable': 'on',
    'contenteditable': 'false'
  });

  dom.setStyles(ghostElm, {
    position: 'absolute',
    opacity: 0.5,
    overflow: 'hidden',
    border: 0,
    padding: 0,
    margin: 0,
    width,
    height
  });

  dom.setStyles(clonedElm, {
    margin: 0,
    boxSizing: 'border-box'
  });

  ghostElm.appendChild(clonedElm);

  return ghostElm;
};

const appendGhostToBody = (ghostElm: HTMLElement, bodyElm: HTMLElement) => {
  if (ghostElm.parentNode !== bodyElm) {
    bodyElm.appendChild(ghostElm);
  }
};

const moveGhost = (
  ghostElm: HTMLElement,
  position: MousePosition.PagePosition,
  width: number,
  height: number,
  maxX: number,
  maxY: number
) => {
  let overflowX = 0, overflowY = 0;

  ghostElm.style.left = position.pageX + 'px';
  ghostElm.style.top = position.pageY + 'px';

  if (position.pageX + width > maxX) {
    overflowX = (position.pageX + width) - maxX;
  }

  if (position.pageY + height > maxY) {
    overflowY = (position.pageY + height) - maxY;
  }

  ghostElm.style.width = (width - overflowX) + 'px';
  ghostElm.style.height = (height - overflowY) + 'px';
};

const removeElement = (elm: HTMLElement) => {
  if (elm && elm.parentNode) {
    elm.parentNode.removeChild(elm);
  }
};

const isLeftMouseButtonPressed = (e: EditorEvent<MouseEvent>) => e.button === 0;

const applyRelPos = (state: State, position: MousePosition.PagePosition) => ({
  pageX: position.pageX - state.relX,
  pageY: position.pageY + 5
});

const start = (state: Singleton.Value<State>, editor: Editor) => (e: EditorEvent<MouseEvent>) => {
  if (isLeftMouseButtonPressed(e)) {
    const ceElm = Arr.find(editor.dom.getParents(e.target as HTMLElement), Predicate.or(isContentEditableFalse, isContentEditableTrue)).getOr(null);

    if (isDraggable(editor.getBody(), ceElm)) {
      const elmPos = editor.dom.getPos(ceElm);
      const bodyElm = editor.getBody();
      const docElm = editor.getDoc().documentElement;

      state.set({
        element: ceElm,
        dragging: false,
        screenX: e.screenX,
        screenY: e.screenY,
        maxX: (editor.inline ? bodyElm.scrollWidth : docElm.offsetWidth) - 2,
        maxY: (editor.inline ? bodyElm.scrollHeight : docElm.offsetHeight) - 2,
        relX: e.pageX - elmPos.x,
        relY: e.pageY - elmPos.y,
        width: ceElm.offsetWidth,
        height: ceElm.offsetHeight,
        ghost: createGhost(editor, ceElm, ceElm.offsetWidth, ceElm.offsetHeight)
      });
    }
  }
};

const move = (state: Singleton.Value<State>, editor: Editor) => {
  // Reduces laggy drag behavior on Gecko
  const throttledPlaceCaretAt = Delay.throttle((clientX: number, clientY: number) => {
    editor._selectionOverrides.hideFakeCaret();
    editor.selection.placeCaretAt(clientX, clientY);
  }, 0);
  editor.on('remove', throttledPlaceCaretAt.stop);

  return (e: EditorEvent<MouseEvent>) => state.on((state) => {
    const movement = Math.max(Math.abs(e.screenX - state.screenX), Math.abs(e.screenY - state.screenY));

    if (!state.dragging && movement > 10) {
      const args = editor.fire('dragstart', { target: state.element as EventTarget } as DragEvent);
      if (args.isDefaultPrevented()) {
        return;
      }

      state.dragging = true;
      editor.focus();
    }

    if (state.dragging) {
      const targetPos = applyRelPos(state, MousePosition.calc(editor, e));

      appendGhostToBody(state.ghost, editor.getBody());
      moveGhost(state.ghost, targetPos, state.width, state.height, state.maxX, state.maxY);

      throttledPlaceCaretAt(e.clientX, e.clientY);
    }
  });
};

// Returns the raw element instead of the fake cE=false element
const getRawTarget = (selection: EditorSelection) => {
  const rng = selection.getSel().getRangeAt(0);
  const startContainer = rng.startContainer;
  return startContainer.nodeType === 3 ? startContainer.parentNode : startContainer;
};

const drop = (state: Singleton.Value<State>, editor: Editor) => (e: EditorEvent<MouseEvent>) => {
  state.on((state) => {
    if (state.dragging) {
      if (isValidDropTarget(editor, getRawTarget(editor.selection), state.element)) {
        const targetClone = cloneElement(state.element);

        const args = editor.fire('drop', {
          clientX: e.clientX,
          clientY: e.clientY
        } as DragEvent);

        if (!args.isDefaultPrevented()) {
          editor.undoManager.transact(() => {
            removeElement(state.element);
            editor.insertContent(editor.dom.getOuterHTML(targetClone));
            editor._selectionOverrides.hideFakeCaret();
          });
        }
      }

      editor.fire('dragend');
    }
  });

  removeDragState(state);
};

const stop = (state: Singleton.Value<State>, editor: Editor) => () => {
  state.on((state) => {
    if (state.dragging) {
      editor.fire('dragend');
    }
  });
  removeDragState(state);
};

const removeDragState = (state: Singleton.Value<State>) => {
  state.on((state) => {
    removeElement(state.ghost);
  });
  state.clear();
};

const bindFakeDragEvents = (editor: Editor) => {
  const state = Singleton.value<State>();

  const pageDom = DOMUtils.DOM;
  const rootDocument = document;
  const dragStartHandler = start(state, editor);
  const dragHandler = move(state, editor);
  const dropHandler = drop(state, editor);
  const dragEndHandler = stop(state, editor);

  editor.on('mousedown', dragStartHandler);
  editor.on('mousemove', dragHandler);
  editor.on('mouseup', dropHandler);

  pageDom.bind(rootDocument, 'mousemove', dragHandler);
  pageDom.bind(rootDocument, 'mouseup', dragEndHandler);

  editor.on('remove', () => {
    pageDom.unbind(rootDocument, 'mousemove', dragHandler);
    pageDom.unbind(rootDocument, 'mouseup', dragEndHandler);
  });

  editor.on('keydown', (e) => {
    // Fire 'dragend' when the escape key is pressed
    if (e.keyCode === VK.ESC) {
      dragEndHandler();
    }
  });
};

const blockIeDrop = (editor: Editor) => {
  editor.on('drop', (e) => {
    // FF doesn't pass out clientX/clientY for drop since this is for IE we just use null instead
    const realTarget = typeof e.clientX !== 'undefined' ? editor.getDoc().elementFromPoint(e.clientX, e.clientY) : null;

    if (isContentEditableFalse(realTarget) || editor.dom.getContentEditableParent(realTarget) === 'false') {
      e.preventDefault();
    }
  });
};

// Block files being dropped within the editor to prevent accidentally navigating away
// while editing. Note that we can't use the `editor.on` API here, as we want these
// to run after the editor event handlers have run. We also bind to the document
// so that it'll try to ensure it's the last thing that runs, as it bubbles up the dom.
const blockUnsupportedFileDrop = (editor: Editor) => {
  const preventFileDrop = (e: EventUtilsEvent<DragEvent>) => {
    if (!e.isDefaultPrevented()) {
      // Prevent file drop events within the editor, as they'll cause the browser to navigate away
      const dataTransfer = e.dataTransfer;
      if (dataTransfer && (Arr.contains(dataTransfer.types, 'Files') || dataTransfer.files.length > 0)) {
        e.preventDefault();
        if (e.type === 'drop') {
          ErrorReporter.displayError(editor, 'Dropped file type is not supported');
        }
      }
    }
  };

  const preventFileDropIfUIElement = (e: EventUtilsEvent<DragEvent>) => {
    if (isUIElement(editor, e.target as Element)) {
      preventFileDrop(e);
    }
  };

  const setup = () => {
    const pageDom = DOMUtils.DOM;
    const dom = editor.dom;
    const doc = document;
    const editorRoot = editor.inline ? editor.getBody() : editor.getDoc();

    const eventNames = [ 'drop', 'dragover' ];
    Arr.each(eventNames, (name) => {
      pageDom.bind(doc, name, preventFileDropIfUIElement);
      dom.bind(editorRoot, name, preventFileDrop);
    });

    editor.on('remove', () => {
      Arr.each(eventNames, (name) => {
        pageDom.unbind(doc, name, preventFileDropIfUIElement);
        dom.unbind(editorRoot, name, preventFileDrop);
      });
    });
  };

  editor.on('init', () => {
    // Use a timeout to ensure this fires after all other init callbacks
    Delay.setEditorTimeout(editor, setup, 0);
  });
};

const init = (editor: Editor) => {
  bindFakeDragEvents(editor);
  blockIeDrop(editor);

  if (Settings.shouldBlockUnsupportedDrop(editor)) {
    blockUnsupportedFileDrop(editor);
  }
};

export {
  init
};
