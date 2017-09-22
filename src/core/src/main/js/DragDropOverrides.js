/**
 * DragDropOverrides.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This module contains logic overriding the drag/drop logic of the editor.
 *
 * @private
 * @class tinymce.DragDropOverrides
 */
define(
  'tinymce.core.DragDropOverrides',
  [
    'global!document',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.MousePosition',
    'tinymce.core.dom.NodeType',
    'tinymce.core.util.Arr',
    'tinymce.core.util.Delay',
    'tinymce.core.util.Fun'
  ],
  function (document, DOMUtils, MousePosition, NodeType, Arr, Delay, Fun) {
    var isContentEditableFalse = NodeType.isContentEditableFalse,
      isContentEditableTrue = NodeType.isContentEditableTrue;

    var isDraggable = function (rootElm, elm) {
      return isContentEditableFalse(elm) && elm !== rootElm;
    };

    var isValidDropTarget = function (editor, targetElement, dragElement) {
      if (targetElement === dragElement || editor.dom.isChildOf(targetElement, dragElement)) {
        return false;
      }

      if (isContentEditableFalse(targetElement)) {
        return false;
      }

      return true;
    };

    var cloneElement = function (elm) {
      var cloneElm = elm.cloneNode(true);
      cloneElm.removeAttribute('data-mce-selected');
      return cloneElm;
    };

    var createGhost = function (editor, elm, width, height) {
      var clonedElm = elm.cloneNode(true);

      editor.dom.setStyles(clonedElm, { width: width, height: height });
      editor.dom.setAttrib(clonedElm, 'data-mce-selected', null);

      var ghostElm = editor.dom.create('div', {
        'class': 'mce-drag-container',
        'data-mce-bogus': 'all',
        unselectable: 'on',
        contenteditable: 'false'
      });

      editor.dom.setStyles(ghostElm, {
        position: 'absolute',
        opacity: 0.5,
        overflow: 'hidden',
        border: 0,
        padding: 0,
        margin: 0,
        width: width,
        height: height
      });

      editor.dom.setStyles(clonedElm, {
        margin: 0,
        boxSizing: 'border-box'
      });

      ghostElm.appendChild(clonedElm);

      return ghostElm;
    };

    var appendGhostToBody = function (ghostElm, bodyElm) {
      if (ghostElm.parentNode !== bodyElm) {
        bodyElm.appendChild(ghostElm);
      }
    };

    var moveGhost = function (ghostElm, position, width, height, maxX, maxY) {
      var overflowX = 0, overflowY = 0;

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

    var removeElement = function (elm) {
      if (elm && elm.parentNode) {
        elm.parentNode.removeChild(elm);
      }
    };

    var isLeftMouseButtonPressed = function (e) {
      return e.button === 0;
    };

    var hasDraggableElement = function (state) {
      return state.element;
    };

    var applyRelPos = function (state, position) {
      return {
        pageX: position.pageX - state.relX,
        pageY: position.pageY + 5
      };
    };

    var start = function (state, editor) {
      return function (e) {
        if (isLeftMouseButtonPressed(e)) {
          var ceElm = Arr.find(editor.dom.getParents(e.target), Fun.or(isContentEditableFalse, isContentEditableTrue));

          if (isDraggable(editor.getBody(), ceElm)) {
            var elmPos = editor.dom.getPos(ceElm);
            var bodyElm = editor.getBody();
            var docElm = editor.getDoc().documentElement;

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

    var move = function (state, editor) {
      // Reduces laggy drag behavior on Gecko
      var throttledPlaceCaretAt = Delay.throttle(function (clientX, clientY) {
        editor._selectionOverrides.hideFakeCaret();
        editor.selection.placeCaretAt(clientX, clientY);
      }, 0);

      return function (e) {
        var movement = Math.max(Math.abs(e.screenX - state.screenX), Math.abs(e.screenY - state.screenY));

        if (hasDraggableElement(state) && !state.dragging && movement > 10) {
          var args = editor.fire('dragstart', { target: state.element });
          if (args.isDefaultPrevented()) {
            return;
          }

          state.dragging = true;
          editor.focus();
        }

        if (state.dragging) {
          var targetPos = applyRelPos(state, MousePosition.calc(editor, e));

          appendGhostToBody(state.ghost, editor.getBody());
          moveGhost(state.ghost, targetPos, state.width, state.height, state.maxX, state.maxY);

          throttledPlaceCaretAt(e.clientX, e.clientY);
        }
      };
    };

    // Returns the raw element instead of the fake cE=false element
    var getRawTarget = function (selection) {
      var rng = selection.getSel().getRangeAt(0);
      var startContainer = rng.startContainer;
      return startContainer.nodeType === 3 ? startContainer.parentNode : startContainer;
    };

    var drop = function (state, editor) {
      return function (e) {
        if (state.dragging) {
          if (isValidDropTarget(editor, getRawTarget(editor.selection), state.element)) {
            var targetClone = cloneElement(state.element);

            var args = editor.fire('drop', {
              targetClone: targetClone,
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

    var stop = function (state, editor) {
      return function () {
        removeDragState(state);
        if (state.dragging) {
          editor.fire('dragend');
        }
      };
    };

    var removeDragState = function (state) {
      state.dragging = false;
      state.element = null;
      removeElement(state.ghost);
    };

    var bindFakeDragEvents = function (editor) {
      var state = {}, pageDom, dragStartHandler, dragHandler, dropHandler, dragEndHandler, rootDocument;

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

    var blockIeDrop = function (editor) {
      editor.on('drop', function (e) {
        // FF doesn't pass out clientX/clientY for drop since this is for IE we just use null instead
        var realTarget = typeof e.clientX !== 'undefined' ? editor.getDoc().elementFromPoint(e.clientX, e.clientY) : null;

        if (isContentEditableFalse(realTarget) || isContentEditableFalse(editor.dom.getContentEditableParent(realTarget))) {
          e.preventDefault();
        }
      });
    };

    var init = function (editor) {
      bindFakeDragEvents(editor);
      blockIeDrop(editor);
    };

    return {
      init: init
    };
  }
);
