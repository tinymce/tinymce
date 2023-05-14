import { DataTransfer, DataTransferContent } from '@ephox/dragster';
import { Arr, Optional, Singleton, Throttler, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import DOMUtils from './api/dom/DOMUtils';
import { EventUtilsEvent } from './api/dom/EventUtils';
import EditorSelection from './api/dom/Selection';
import Editor from './api/Editor';
import * as Options from './api/Options';
import Delay from './api/util/Delay';
import { EditorEvent } from './api/util/EventDispatcher';
import VK from './api/util/VK';
import * as ClosestCaretCandidate from './caret/ClosestCaretCandidate';
import * as MousePosition from './dom/MousePosition';
import * as NodeType from './dom/NodeType';
import * as PaddingBr from './dom/PaddingBr';
import * as ErrorReporter from './ErrorReporter';
import * as DragEvents from './events/DragEvents';
import { isUIElement } from './focus/FocusController';
import * as Predicate from './util/Predicate';

/**
 * This module contains logic overriding the drag/drop logic of the editor.
 *
 * @private
 * @class tinymce.DragDropOverrides
 */

// Arbitrary values needed when scrolling CEF elements
const scrollPixelsPerInterval = 32;
const scrollIntervalValue = 100;
const mouseRangeToTriggerScrollInsideEditor = 8;
const mouseRangeToTriggerScrollOutsideEditor = 16;

interface State {
  element: HTMLElement;
  dataTransfer: DataTransfer;
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
  intervalId: Singleton.Repeatable;
}

const isContentEditableFalse = NodeType.isContentEditableFalse;
const isContentEditable = Predicate.or(isContentEditableFalse, NodeType.isContentEditableTrue) as (node: Node) => node is HTMLElement;

const isDraggable = (dom: DOMUtils, rootElm: HTMLElement, elm: HTMLElement) =>
  isContentEditableFalse(elm) && elm !== rootElm && dom.isEditable(elm.parentElement);

const isValidDropTarget = (editor: Editor, targetElement: Node | null, dragElement: Node) => {
  if (Type.isNullable(targetElement)) {
    return false;
  } else if (targetElement === dragElement || editor.dom.isChildOf(targetElement, dragElement)) {
    return false;
  } else {
    return editor.dom.isEditable(targetElement);
  }
};

const createGhost = (editor: Editor, elm: HTMLElement, width: number, height: number) => {
  const dom = editor.dom;
  const clonedElm = elm.cloneNode(true) as HTMLElement;

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

// Helper function needed for scrolling the editor inside moveGhost function
const scrollEditor = (direction: 'top' | 'left', amount: number) => (win: Window) => () => {
  const current = direction === 'left' ? win.scrollX : win.scrollY;
  win.scroll({
    [direction]: current + amount,
    behavior: 'smooth',
  });
};

const scrollLeft = scrollEditor('left', -scrollPixelsPerInterval);
const scrollRight = scrollEditor('left', scrollPixelsPerInterval);
const scrollUp = scrollEditor('top', -scrollPixelsPerInterval);
const scrollDown = scrollEditor('top', scrollPixelsPerInterval);

const moveGhost = (
  ghostElm: HTMLElement,
  position: MousePosition.PagePosition,
  width: number,
  height: number,
  maxX: number,
  maxY: number,
  mouseY: number,
  mouseX: number,
  contentAreaContainer: HTMLElement,
  win: Window,
  state: Singleton.Value<State>,
  mouseEventOriginatedFromWithinTheEditor: boolean
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

  // Code needed for dragging CEF elements (specifically fixing TINY-8874)
  // The idea behind the algorithm is that the user will start dragging the
  // CEF element to the edge of the editor and that would cause scrolling.
  // The way that happens is that the user will trigger a mousedown event,
  // then a mousemove event until they reach the edge of the editor. Then
  // no event triggers. That's when I set an interval to keep scrolling the editor.
  // Once a new event triggers I clear the existing interval and set it back to none.

  const clientHeight = contentAreaContainer.clientHeight;
  const clientWidth = contentAreaContainer.clientWidth;
  const outerMouseY = mouseY + contentAreaContainer.getBoundingClientRect().top;
  const outerMouseX = mouseX + contentAreaContainer.getBoundingClientRect().left;

  state.on((state) => {
    state.intervalId.clear();
    if (state.dragging && mouseEventOriginatedFromWithinTheEditor) {
      // This basically means that the mouse is close to the bottom edge
      // (within MouseRange pixels of the bottom edge)
      if (mouseY + mouseRangeToTriggerScrollInsideEditor >= clientHeight) {
        state.intervalId.set(scrollDown(win));
        // This basically means that the mouse is close to the top edge
        // (within MouseRange pixels)
      } else if (mouseY - mouseRangeToTriggerScrollInsideEditor <= 0) {
        state.intervalId.set(scrollUp(win));
        // This basically means that the mouse is close to the right edge
        // (within MouseRange pixels of the right edge)
      } else if (mouseX + mouseRangeToTriggerScrollInsideEditor >= clientWidth) {
        state.intervalId.set(scrollRight(win));
        // This basically means that the mouse is close to the left edge
        // (within MouseRange pixels of the left edge)
      } else if (mouseX - mouseRangeToTriggerScrollInsideEditor <= 0) {
        state.intervalId.set(scrollLeft(win));
        // This basically means that the mouse is close to the bottom edge
        // of the page (within MouseRange pixels) when the bottom of
        // the editor is offscreen
      } else if (outerMouseY + mouseRangeToTriggerScrollOutsideEditor >= window.innerHeight) {
        state.intervalId.set(scrollDown(window));
        // This basically means that the mouse is close to the upper edge
        // of the page (within MouseRange pixels) when the top of
        // the editor is offscreen
      } else if (outerMouseY - mouseRangeToTriggerScrollOutsideEditor <= 0) {
        state.intervalId.set(scrollUp(window));
        // This basically means that the mouse is close to the right edge
        // of the page (within MouseRange pixels) when the right edge of
        // the editor is offscreen
      } else if (outerMouseX + mouseRangeToTriggerScrollOutsideEditor >= window.innerWidth) {
        state.intervalId.set(scrollRight(window));
        // This basically means that the mouse is close to the left edge
        // of the page (within MouseRange pixels) when the left edge of
        // the editor is offscreen
      } else if (outerMouseX - mouseRangeToTriggerScrollOutsideEditor <= 0) {
        state.intervalId.set(scrollLeft(window));
      }
    }
  });
};

const removeElement = (elm: HTMLElement) => {
  if (elm && elm.parentNode) {
    elm.parentNode.removeChild(elm);
  }
};

const removeElementWithPadding = (dom: DOMUtils, elm: HTMLElement) => {
  const parentBlock = dom.getParent(elm.parentNode, dom.isBlock);

  removeElement(elm);
  if (parentBlock && parentBlock !== dom.getRoot() && dom.isEmpty(parentBlock)) {
    PaddingBr.fillWithPaddingBr(SugarElement.fromDom(parentBlock));
  }
};

const isLeftMouseButtonPressed = (e: EditorEvent<MouseEvent>) => e.button === 0;

const applyRelPos = (state: State, position: MousePosition.PagePosition) => ({
  pageX: position.pageX - state.relX,
  pageY: position.pageY + 5
});

const start = (state: Singleton.Value<State>, editor: Editor) => (e: EditorEvent<MouseEvent>) => {
  if (isLeftMouseButtonPressed(e)) {
    const ceElm = Arr.find(editor.dom.getParents(e.target as Node), isContentEditable).getOr(null);

    if (Type.isNonNullable(ceElm) && isDraggable(editor.dom, editor.getBody(), ceElm)) {
      const elmPos = editor.dom.getPos(ceElm);
      const bodyElm = editor.getBody();
      const docElm = editor.getDoc().documentElement;

      state.set({
        element: ceElm,
        dataTransfer: DataTransfer.createDataTransfer(),
        dragging: false,
        screenX: e.screenX,
        screenY: e.screenY,
        maxX: (editor.inline ? bodyElm.scrollWidth : docElm.offsetWidth) - 2,
        maxY: (editor.inline ? bodyElm.scrollHeight : docElm.offsetHeight) - 2,
        relX: e.pageX - elmPos.x,
        relY: e.pageY - elmPos.y,
        width: ceElm.offsetWidth,
        height: ceElm.offsetHeight,
        ghost: createGhost(editor, ceElm, ceElm.offsetWidth, ceElm.offsetHeight),
        intervalId: Singleton.repeatable(scrollIntervalValue)
      });
    }
  }
};

const placeCaretAt = (editor: Editor, clientX: number, clientY: number) => {
  editor._selectionOverrides.hideFakeCaret();
  ClosestCaretCandidate.closestFakeCaretCandidate(editor.getBody(), clientX, clientY).fold(
    () => editor.selection.placeCaretAt(clientX, clientY),
    (caretInfo) => {
      const range = editor._selectionOverrides.showCaret(1, caretInfo.node as HTMLElement, caretInfo.position === ClosestCaretCandidate.FakeCaretPosition.Before, false);
      if (range) {
        editor.selection.setRng(range);
      } else {
        editor.selection.placeCaretAt(clientX, clientY);
      }
    }
  );
};

const dispatchDragEvent = (editor: Editor, type: DragEvents.DragEventType, target: Element, dataTransfer: DataTransfer, mouseEvent?: EditorEvent<MouseEvent>): EditorEvent<DragEvent> => {
  if (type === 'dragstart') {
    DataTransferContent.setHtmlData(dataTransfer, editor.dom.getOuterHTML(target));
  }

  const event = DragEvents.makeDragEvent(type, target, dataTransfer, mouseEvent);
  const args = editor.dispatch(type, event);

  return args;
};

const move = (state: Singleton.Value<State>, editor: Editor) => {
  // Reduces laggy drag behavior on Gecko
  const throttledPlaceCaretAt = Throttler.first((clientX: number, clientY: number) => placeCaretAt(editor, clientX, clientY), 0);
  editor.on('remove', throttledPlaceCaretAt.cancel);
  const state_ = state;

  return (e: EditorEvent<MouseEvent>) => state.on((state) => {
    const movement = Math.max(Math.abs(e.screenX - state.screenX), Math.abs(e.screenY - state.screenY));

    if (!state.dragging && movement > 10) {
      const args = dispatchDragEvent(editor, 'dragstart', state.element, state.dataTransfer, e);
      // TINY-9601: dataTransfer is writable in dragstart, so keep it up-to-date
      if (Type.isNonNullable(args.dataTransfer)) {
        state.dataTransfer = args.dataTransfer;
      }

      if (args.isDefaultPrevented()) {
        return;
      }

      state.dragging = true;
      editor.focus();
    }

    if (state.dragging) {
      const mouseEventOriginatedFromWithinTheEditor = e.currentTarget === editor.getDoc().documentElement;
      const targetPos = applyRelPos(state, MousePosition.calc(editor, e));
      appendGhostToBody(state.ghost, editor.getBody());
      moveGhost(state.ghost, targetPos, state.width, state.height, state.maxX, state.maxY, e.clientY, e.clientX, editor.getContentAreaContainer(), editor.getWin(), state_, mouseEventOriginatedFromWithinTheEditor);
      throttledPlaceCaretAt.throttle(e.clientX, e.clientY);
    }
  });
};

// Returns the raw element instead of the fake cE=false element
const getRawTarget = (selection: EditorSelection): Node | null => {
  const sel = selection.getSel();
  if (Type.isNonNullable(sel)) {
    const rng = sel.getRangeAt(0);
    const startContainer = rng.startContainer;
    return NodeType.isText(startContainer) ? startContainer.parentNode : startContainer;
  } else {
    return null;
  }
};

const drop = (state: Singleton.Value<State>, editor: Editor) => (e: EditorEvent<MouseEvent>) => {
  state.on((state) => {
    state.intervalId.clear();
    if (state.dragging) {
      if (isValidDropTarget(editor, getRawTarget(editor.selection), state.element)) {
        const dropTarget = editor.getDoc().elementFromPoint(e.clientX, e.clientY) ?? editor.getBody();
        const args = dispatchDragEvent(editor, 'drop', dropTarget, state.dataTransfer, e);

        if (!args.isDefaultPrevented()) {
          editor.undoManager.transact(() => {
            removeElementWithPadding(editor.dom, state.element);
            // TINY-9601: Use dataTransfer property to determine inserted content on drop. This allows users to
            // manipulate drop content by modifying dataTransfer in the dragstart event.
            DataTransferContent.getHtmlData(state.dataTransfer).each((content) => editor.insertContent(content));
            editor._selectionOverrides.hideFakeCaret();
          });
        }
      }

      // Use body as the target since the element we are dragging no longer exists. Native drag/drop works in a similar way.
      dispatchDragEvent(editor, 'dragend', editor.getBody(), state.dataTransfer, e);
    }
  });

  removeDragState(state);
};

const stopDragging = (state: Singleton.Value<State>, editor: Editor, e: Optional<EditorEvent<MouseEvent>>) => {
  state.on((state) => {
    state.intervalId.clear();
    if (state.dragging) {
      e.fold(
        () => dispatchDragEvent(editor, 'dragend', state.element, state.dataTransfer),
        (mouseEvent) => dispatchDragEvent(editor, 'dragend', state.element, state.dataTransfer, mouseEvent)
      );
    }
  });
  removeDragState(state);
};

const stop = (state: Singleton.Value<State>, editor: Editor) => (e: EditorEvent<MouseEvent>) =>
  stopDragging(state, editor, Optional.some(e));

const removeDragState = (state: Singleton.Value<State>) => {
  state.on((state) => {
    state.intervalId.clear();
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
      stopDragging(state, editor, Optional.none());
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

const init = (editor: Editor): void => {
  bindFakeDragEvents(editor);

  if (Options.shouldBlockUnsupportedDrop(editor)) {
    blockUnsupportedFileDrop(editor);
  }
};

export {
  init
};
