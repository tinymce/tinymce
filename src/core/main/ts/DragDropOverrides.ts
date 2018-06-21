/**
 * DragDropOverrides.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import DOMUtils from './api/dom/DOMUtils';
import MousePosition from './dom/MousePosition';
import NodeType from './dom/NodeType';
import Arr from './util/Arr';
import Delay from './api/util/Delay';
import Fun from './util/Fun';
import { document } from '@ephox/dom-globals';

/**
 * This module contains logic overriding the drag/drop logic of the editor.
 *
 * @private
 * @class tinymce.DragDropOverrides
 */

const isContentEditableFalse = NodeType.isContentEditableFalse,
  isContentEditableTrue = NodeType.isContentEditableTrue;

const isDraggable = function (rootElm, elm) {
  return isContentEditableFalse(elm) && elm !== rootElm;
};

const isValidDropTarget = function (editor, targetElement, dragElement) {
  if (targetElement === dragElement || editor.dom.isChildOf(targetElement, dragElement)) {
    return false;
  }

  if (isContentEditableFalse(targetElement)) {
    return false;
  }

  return true;
};

const cloneElement = function (elm) {
  const cloneElm = elm.cloneNode(true);
  cloneElm.removeAttribute('data-mce-selected');
  return cloneElm;
};

const createGhost = function (editor, elm, width, height) {
  const clonedElm = elm.cloneNode(true);

  editor.dom.setStyles(clonedElm, { width, height });
  editor.dom.setAttrib(clonedElm, 'data-mce-selected', null);

  const ghostElm = editor.dom.create('div', {
    'class': 'mce-drag-container',
    'data-mce-bogus': 'all',
    'unselectable': 'on',
    'contenteditable': 'false'
  });

  editor.dom.setStyles(ghostElm, {
    position: 'absolute',
    opacity: 0.5,
    overflow: 'hidden',
    border: 0,
    padding: 0,
    margin: 0,
    width,
    height
  });

  editor.dom.setStyles(clonedElm, {
    margin: 0,
    boxSizing: 'border-box'
  });

  ghostElm.appendChild(clonedElm);

  return ghostElm;
};

const appendGhostToBody = function (ghostElm, bodyElm) {
  if (ghostElm.parentNode !== bodyElm) {
    bodyElm.appendChild(ghostElm);
  }
};

const moveGhost = function (ghostElm, position, width, height, maxX, maxY) {
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

const removeElement = function (elm) {
  if (elm && elm.parentNode) {
    elm.parentNode.removeChild(elm);
  }
};

const isLeftMouseButtonPressed = function (e) {
  return e.button === 0;
};

const hasDraggableElement = function (state) {
  return state.element;
};

const applyRelPos = function (state, position) {
  return {
    pageX: position.pageX - state.relX,
    pageY: position.pageY + 5
  };
};

const start = function (state, editor) {
  return function (e) {
    if (isLeftMouseButtonPressed(e)) {
      const ceElm = Arr.find(editor.dom.getParents(e.target), Fun.or(isContentEditableFalse, isContentEditableTrue));

      if (isDraggable(editor.getBody(), ceElm)) {
        const elmPos = editor.dom.getPos(ceElm);
        const bodyElm = editor.getBody();
        const docElm = editor.getDoc().documentElement;

        state.element = ceElm;
        state.screenX = e.screenX;
        state.screenY = e.screenY;
        state.maxX = (editor.inline ? bodyElm.scrollWidth : docElm.offsetWidth) - 2;
        state.maxY = (editor.inline ? bodyElm.scrollHeight : docElm.offsetHeight) - 2;
        state.relX = e.pageX - elmPos.x;
        state.relY = e.pageY - elmPos.y;
        state.width = ceElm.offsetWidth;
        state.height = ceElm.offsetHeight;
        state.ghost = createGhost(editor, ceElm, state.width, state.height);
      }
    }
  };
};

const move = function (state, editor) {
  // Reduces laggy drag behavior on Gecko
  const throttledPlaceCaretAt = Delay.throttle(function (clientX, clientY) {
    editor._selectionOverrides.hideFakeCaret();
    editor.selection.placeCaretAt(clientX, clientY);
  }, 0);

  return function (e) {
    const movement = Math.max(Math.abs(e.screenX - state.screenX), Math.abs(e.screenY - state.screenY));

    if (hasDraggableElement(state) && !state.dragging && movement > 10) {
      const args = editor.fire('dragstart', { target: state.element });
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
  };
};

// Returns the raw element instead of the fake cE=false element
const getRawTarget = function (selection) {
  const rng = selection.getSel().getRangeAt(0);
  const startContainer = rng.startContainer;
  return startContainer.nodeType === 3 ? startContainer.parentNode : startContainer;
};

const drop = function (state, editor) {
  return function (e) {
    if (state.dragging) {
      if (isValidDropTarget(editor, getRawTarget(editor.selection), state.element)) {
        let targetClone = cloneElement(state.element);

        const args = editor.fire('drop', {
          targetClone,
          clientX: e.clientX,
          clientY: e.clientY
        });

        if (!args.isDefaultPrevented()) {
          targetClone = args.targetClone;

          editor.undoManager.transact(function () {
            removeElement(state.element);
            editor.insertContent(editor.dom.getOuterHTML(targetClone));
            editor._selectionOverrides.hideFakeCaret();
          });
        }
      }
    }

    removeDragState(state);
  };
};

const stop = function (state, editor) {
  return function () {
    if (state.dragging) {
      editor.fire('dragend');
    }
    removeDragState(state);
  };
};

const removeDragState = function (state) {
  state.dragging = false;
  state.element = null;
  removeElement(state.ghost);
};

const bindFakeDragEvents = function (editor) {
  const state = {};
  let pageDom, dragStartHandler, dragHandler, dropHandler, dragEndHandler, rootDocument;

  pageDom = DOMUtils.DOM;
  rootDocument = document;
  dragStartHandler = start(state, editor);
  dragHandler = move(state, editor);
  dropHandler = drop(state, editor);
  dragEndHandler = stop(state, editor);

  editor.on('mousedown', dragStartHandler);
  editor.on('mousemove', dragHandler);
  editor.on('mouseup', dropHandler);

  pageDom.bind(rootDocument, 'mousemove', dragHandler);
  pageDom.bind(rootDocument, 'mouseup', dragEndHandler);

  editor.on('remove', function () {
    pageDom.unbind(rootDocument, 'mousemove', dragHandler);
    pageDom.unbind(rootDocument, 'mouseup', dragEndHandler);
  });
};

const blockIeDrop = function (editor) {
  editor.on('drop', function (e) {
    // FF doesn't pass out clientX/clientY for drop since this is for IE we just use null instead
    const realTarget = typeof e.clientX !== 'undefined' ? editor.getDoc().elementFromPoint(e.clientX, e.clientY) : null;

    if (isContentEditableFalse(realTarget) || isContentEditableFalse(editor.dom.getContentEditableParent(realTarget))) {
      e.preventDefault();
    }
  });
};

const init = function (editor) {
  bindFakeDragEvents(editor);
  blockIeDrop(editor);
};

export default {
  init
};
