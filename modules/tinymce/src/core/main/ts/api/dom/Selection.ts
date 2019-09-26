/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Selection as NativeSelection, HTMLElement, Node, Range, Element, ClientRect, Window } from '@ephox/dom-globals';
import { Compare, Element as SugarElement } from '@ephox/sugar';
import Env from '../Env';
import BookmarkManager from './BookmarkManager';
import CaretPosition from '../../caret/CaretPosition';
import ControlSelection from './ControlSelection';
import NodeType from '../../dom/NodeType';
import ScrollIntoView from '../../dom/ScrollIntoView';
import EditorFocus from '../../focus/EditorFocus';
import CaretRangeFromPoint from '../../selection/CaretRangeFromPoint';
import EventProcessRanges from '../../selection/EventProcessRanges';
import GetSelectionContent from '../../selection/GetSelectionContent';
import MultiRange from '../../selection/MultiRange';
import NormalizeRange from '../../selection/NormalizeRange';
import SelectionBookmark from '../../selection/SelectionBookmark';
import SetSelectionContent from '../../selection/SetSelectionContent';
import * as ElementSelection from '../../selection/ElementSelection';
import { moveEndPoint, hasAnyRanges } from '../../selection/SelectionUtils';
import Editor from '../Editor';
import DOMUtils from './DOMUtils';
import SelectorChanged from './SelectorChanged';
import Serializer from './Serializer';

/**
 * This class handles text and control selection it's an crossbrowser utility class.
 * Consult the TinyMCE API Documentation for more details and examples on how to use this class.
 *
 * @class tinymce.dom.Selection
 * @example
 * // Getting the currently selected node for the active editor
 * alert(tinymce.activeEditor.selection.getNode().nodeName);
 */

const isNativeIeSelection = (rng: any): boolean => {
  return !!(<any> rng).select;
};

const isAttachedToDom = function (node: Node): boolean {
  return !!(node && node.ownerDocument) && Compare.contains(SugarElement.fromDom(node.ownerDocument), SugarElement.fromDom(node));
};

const isValidRange = function (rng: Range) {
  if (!rng) {
    return false;
  } else if (isNativeIeSelection(rng)) { // Native IE range still produced by placeCaretAt
    return true;
  } else {
    return isAttachedToDom(rng.startContainer) && isAttachedToDom(rng.endContainer);
  }
};

interface Selection {
  bookmarkManager: any;
  controlSelection: ControlSelection;
  dom: any;
  win: Window;
  serializer: any;
  editor: any;
  collapse: (toStart?: boolean) => void;
  setCursorLocation: (node?: Node, offset?: number) => void;
  getContent: (args?: any) => any;
  setContent: (content: any, args?: any) => void;
  getBookmark: (type?: number, normalized?: boolean) => any;
  moveToBookmark: (bookmark: any) => boolean;
  select: (node: Node, content?: boolean) => Node;
  isCollapsed: () => boolean;
  isForward: () => boolean;
  setNode: (elm: Element) => Element;
  getNode: () => Element;
  getSel: () => NativeSelection;
  setRng: (rng: Range, forward?: boolean) => void;
  getRng: () => Range;
  getStart: (real?: boolean) => Element;
  getEnd: (real?: boolean) => Element;
  getSelectedBlocks: (startElm?: Element, endElm?: Element) => Element[];
  normalize: () => Range;
  selectorChanged: (selector: string, callback: (active: boolean, args: {
      node: Node;
      selector: String;
      parents: Element[];
  }) => void) => any;
  selectorChangedWithUnbind: (selector: string, callback: (active: boolean, args: {
    node: Node;
    selector: String;
    parents: Element[];
  }) => void) => { unbind: () => void };
  getScrollContainer: () => HTMLElement;
  scrollIntoView: (elm: Element, alignToTop?: boolean) => void;
  placeCaretAt: (clientX: number, clientY: number) => void;
  getBoundingClientRect: () => ClientRect;
  destroy: () => void;
}

/**
 * Constructs a new selection instance.
 *
 * @constructor
 * @method Selection
 * @param {tinymce.dom.DOMUtils} dom DOMUtils object reference.
 * @param {Window} win Window to bind the selection object to.
 * @param {tinymce.dom.Serializer} serializer DOM serialization class to use for getContent.
 * @param {tinymce.Editor} editor Editor instance of the selection.
 */
const Selection = function (dom: DOMUtils, win: Window, serializer: Serializer, editor: Editor): Selection {
  let bookmarkManager: BookmarkManager;
  let controlSelection: ControlSelection;
  let selectedRange: Range | null;
  let explicitRange: Range | null;

  const { selectorChangedWithUnbind } = SelectorChanged(dom, editor);

  /**
   * Move the selection cursor range to the specified node and offset.
   * If there is no node specified it will move it to the first suitable location within the body.
   *
   * @method setCursorLocation
   * @param {Node} node Optional node to put the cursor in.
   * @param {Number} offset Optional offset from the start of the node to put the cursor at.
   */
  const setCursorLocation = (node?: Node, offset?: number) => {
    const rng = dom.createRng();

    if (!node) {
      moveEndPoint(dom, rng, editor.getBody(), true);
      setRng(rng);
    } else {
      rng.setStart(node, offset);
      rng.setEnd(node, offset);
      setRng(rng);
      collapse(false);
    }
  };

  /**
   * Returns the selected contents using the DOM serializer passed in to this class.
   *
   * @method getContent
   * @param {Object} args Optional settings class with for example output format text or html.
   * @return {String} Selected contents in for example HTML format.
   * @example
   * // Alerts the currently selected contents
   * alert(tinymce.activeEditor.selection.getContent());
   *
   * // Alerts the currently selected contents as plain text
   * alert(tinymce.activeEditor.selection.getContent({format: 'text'}));
   */
  const getContent = (args) => GetSelectionContent.getContent(editor, args);

  /**
   * Sets the current selection to the specified content. If any contents is selected it will be replaced
   * with the contents passed in to this function. If there is no selection the contents will be inserted
   * where the caret is placed in the editor/page.
   *
   * @method setContent
   * @param {String} content HTML contents to set could also be other formats depending on settings.
   * @param {Object} args Optional settings object with for example data format.
   * @example
   * // Inserts some HTML contents at the current selection
   * tinymce.activeEditor.selection.setContent('<strong>Some contents</strong>');
   */
  const setContent = (content, args?) => SetSelectionContent.setContent(editor, content, args);

  /**
   * Returns the start element of a selection range. If the start is in a text
   * node the parent element will be returned.
   *
   * @method getStart
   * @param {Boolean} real Optional state to get the real parent when the selection is collapsed not the closest element.
   * @return {Element} Start element of selection range.
   */
  const getStart = (real?: boolean): Element => ElementSelection.getStart(editor.getBody(), getRng(), real);

  /**
   * Returns the end element of a selection range. If the end is in a text
   * node the parent element will be returned.
   *
   * @method getEnd
   * @param {Boolean} real Optional state to get the real parent when the selection is collapsed not the closest element.
   * @return {Element} End element of selection range.
   */
  const getEnd = (real?: boolean): Element => ElementSelection.getEnd(editor.getBody(), getRng(), real);

  /**
   * Returns a bookmark location for the current selection. This bookmark object
   * can then be used to restore the selection after some content modification to the document.
   *
   * @method getBookmark
   * @param {Number} type Optional state if the bookmark should be simple or not. Default is complex.
   * @param {Boolean} normalized Optional state that enables you to get a position that it would be after normalization.
   * @return {Object} Bookmark object, use moveToBookmark with this object to restore the selection.
   * @example
   * // Stores a bookmark of the current selection
   * var bm = tinymce.activeEditor.selection.getBookmark();
   *
   * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
   *
   * // Restore the selection bookmark
   * tinymce.activeEditor.selection.moveToBookmark(bm);
   */
  const getBookmark = (type?: number, normalized?: boolean) => bookmarkManager.getBookmark(type, normalized);

  /**
   * Restores the selection to the specified bookmark.
   *
   * @method moveToBookmark
   * @param {Object} bookmark Bookmark to restore selection from.
   * @return {Boolean} true/false if it was successful or not.
   * @example
   * // Stores a bookmark of the current selection
   * var bm = tinymce.activeEditor.selection.getBookmark();
   *
   * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
   *
   * // Restore the selection bookmark
   * tinymce.activeEditor.selection.moveToBookmark(bm);
   */
  const moveToBookmark = (bookmark): boolean => bookmarkManager.moveToBookmark(bookmark);

  /**
   * Selects the specified element. This will place the start and end of the selection range around the element.
   *
   * @method select
   * @param {Element} node HTML DOM element to select.
   * @param {Boolean} content Optional bool state if the contents should be selected or not on non IE browser.
   * @return {Element} Selected element the same element as the one that got passed in.
   * @example
   * // Select the first paragraph in the active editor
   * tinymce.activeEditor.selection.select(tinymce.activeEditor.dom.select('p')[0]);
   */
  const select = (node: Node, content?: boolean) => {
    ElementSelection.select(dom, node, content).each(setRng);
    return node;
  };

  /**
   * Returns true/false if the selection range is collapsed or not. Collapsed means if it's a caret or a larger selection.
   *
   * @method isCollapsed
   * @return {Boolean} true/false state if the selection range is collapsed or not.
   * Collapsed means if it's a caret or a larger selection.
   */
  const isCollapsed = (): boolean => {
    const rng: any = getRng(), sel = getSel();

    if (!rng || rng.item) {
      return false;
    }

    if (rng.compareEndPoints) {
      return rng.compareEndPoints('StartToEnd', rng) === 0;
    }

    return !sel || rng.collapsed;
  };

  /**
   * Collapse the selection to start or end of range.
   *
   * @method collapse
   * @param {Boolean} toStart Optional boolean state if to collapse to end or not. Defaults to false.
   */
  const collapse = (toStart?: boolean) => {
    const rng = getRng();

    rng.collapse(!!toStart);
    setRng(rng);
  };

  /**
   * Returns the browsers internal selection object.
   *
   * @method getSel
   * @return {Selection} Internal browser selection object.
   */
  const getSel = (): NativeSelection => win.getSelection ? win.getSelection() : (<any> win.document).selection;

  /**
   * Returns the browsers internal range object.
   *
   * @method getRng
   * @return {Range} Internal browser range object.
   * @see http://www.quirksmode.org/dom/range_intro.html
   * @see http://www.dotvoid.com/2001/03/using-the-range-object-in-mozilla/
   */
  const getRng = (): Range | null => {
    let selection, rng, elm, doc;

    const tryCompareBoundaryPoints = function (how, sourceRange, destinationRange) {
      try {
        return sourceRange.compareBoundaryPoints(how, destinationRange);
      } catch (ex) {
        // Gecko throws wrong document exception if the range points
        // to nodes that where removed from the dom #6690
        // Browsers should mutate existing DOMRange instances so that they always point
        // to something in the document this is not the case in Gecko works fine in IE/WebKit/Blink
        // For performance reasons just return -1
        return -1;
      }
    };

    if (!win) {
      return null;
    }

    doc = win.document;

    if (typeof doc === 'undefined' || doc === null) {
      return null;
    }

    if (editor.bookmark !== undefined && EditorFocus.hasFocus(editor) === false) {
      const bookmark = SelectionBookmark.getRng(editor);

      if (bookmark.isSome()) {
        return bookmark.map((r) => EventProcessRanges.processRanges(editor, [r])[0]).getOr(doc.createRange());
      }
    }

    try {
      if ((selection = getSel()) && !NodeType.isRestrictedNode(selection.anchorNode)) {
        if (selection.rangeCount > 0) {
          rng = selection.getRangeAt(0);
        } else {
          rng = selection.createRange ? selection.createRange() : doc.createRange();
        }
      }
    } catch (ex) {
      // IE throws unspecified error here if TinyMCE is placed in a frame/iframe
    }

    rng = EventProcessRanges.processRanges(editor, [rng])[0];

    // No range found then create an empty one
    // This can occur when the editor is placed in a hidden container element on Gecko
    // Or on IE when there was an exception
    if (!rng) {
      rng = doc.createRange ? doc.createRange() : doc.body.createTextRange();
    }

    // If range is at start of document then move it to start of body
    if (rng.setStart && rng.startContainer.nodeType === 9 && rng.collapsed) {
      elm = dom.getRoot();
      rng.setStart(elm, 0);
      rng.setEnd(elm, 0);
    }

    if (selectedRange && explicitRange) {
      if (tryCompareBoundaryPoints(rng.START_TO_START, rng, selectedRange) === 0 &&
        tryCompareBoundaryPoints(rng.END_TO_END, rng, selectedRange) === 0) {
        // Safari, Opera and Chrome only ever select text which causes the range to change.
        // This lets us use the originally set range if the selection hasn't been changed by the user.
        rng = explicitRange;
      } else {
        selectedRange = null;
        explicitRange = null;
      }
    }

    return rng;
  };

  /**
   * Changes the selection to the specified DOM range.
   *
   * @method setRng
   * @param {Range} rng Range to select.
   * @param {Boolean} forward Optional boolean if the selection is forwards or backwards.
   */
  const setRng = (rng: Range, forward?: boolean) => {
    let sel, node, evt;

    if (!isValidRange(rng)) {
      return;
    }

    // Is IE specific range
    const ieRange: any = isNativeIeSelection(rng) ? rng : null;
    if (ieRange) {
      explicitRange = null;

      try {
        ieRange.select();
      } catch (ex) {
        // Needed for some odd IE bug #1843306
      }

      return;
    }

    sel = getSel();

    evt = editor.fire('SetSelectionRange', { range: rng, forward });
    rng = evt.range;

    if (sel) {
      explicitRange = rng;

      try {
        sel.removeAllRanges();
        sel.addRange(rng);
      } catch (ex) {
        // IE might throw errors here if the editor is within a hidden container and selection is changed
      }

      // Forward is set to false and we have an extend function
      if (forward === false && sel.extend) {
        sel.collapse(rng.endContainer, rng.endOffset);
        sel.extend(rng.startContainer, rng.startOffset);
      }

      // adding range isn't always successful so we need to check range count otherwise an exception can occur
      selectedRange = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;
    }

    // WebKit egde case selecting images works better using setBaseAndExtent when the image is floated
    if (!rng.collapsed && rng.startContainer === rng.endContainer && sel.setBaseAndExtent && !Env.ie) {
      if (rng.endOffset - rng.startOffset < 2) {
        if (rng.startContainer.hasChildNodes()) {
          node = rng.startContainer.childNodes[rng.startOffset];
          if (node && node.tagName === 'IMG') {
            sel.setBaseAndExtent(
              rng.startContainer,
              rng.startOffset,
              rng.endContainer,
              rng.endOffset
            );

            // Since the setBaseAndExtent is fixed in more recent Blink versions we
            // need to detect if it's doing the wrong thing and falling back to the
            // crazy incorrect behavior api call since that seems to be the only way
            // to get it to work on Safari WebKit as of 2017-02-23
            if (sel.anchorNode !== rng.startContainer || sel.focusNode !== rng.endContainer) {
              sel.setBaseAndExtent(node, 0, node, 1);
            }
          }
        }
      }
    }

    editor.fire('AfterSetSelectionRange', { range: rng, forward });
  };

  /**
   * Sets the current selection to the specified DOM element.
   *
   * @method setNode
   * @param {Element} elm Element to set as the contents of the selection.
   * @return {Element} Returns the element that got passed in.
   * @example
   * // Inserts a DOM node at current selection/caret location
   * tinymce.activeEditor.selection.setNode(tinymce.activeEditor.dom.create('img', {src: 'some.gif', title: 'some title'}));
   */
  const setNode = (elm: Element): Element => {
    setContent(dom.getOuterHTML(elm));
    return elm;
  };

  /**
   * Returns the currently selected element or the common ancestor element for both start and end of the selection.
   *
   * @method getNode
   * @return {Element} Currently selected element or common ancestor element.
   * @example
   * // Alerts the currently selected elements node name
   * alert(tinymce.activeEditor.selection.getNode().nodeName);
   */
  const getNode = (): Element => ElementSelection.getNode(editor.getBody(), getRng());

  const getSelectedBlocks = (startElm: Element, endElm: Element) => ElementSelection.getSelectedBlocks(dom, getRng(), startElm, endElm);

  const isForward = (): boolean => {
    const sel = getSel();
    let anchorRange,
      focusRange;

    // No support for selection direction then always return true
    if (!sel || !sel.anchorNode || !sel.focusNode) {
      return true;
    }

    anchorRange = dom.createRng();
    anchorRange.setStart(sel.anchorNode, sel.anchorOffset);
    anchorRange.collapse(true);

    focusRange = dom.createRng();
    focusRange.setStart(sel.focusNode, sel.focusOffset);
    focusRange.collapse(true);

    return anchorRange.compareBoundaryPoints(anchorRange.START_TO_START, focusRange) <= 0;
  };

  const normalize = (): Range => {
    const rng = getRng();
    const sel = getSel();

    if (!MultiRange.hasMultipleRanges(sel) && hasAnyRanges(editor)) {
      const normRng = NormalizeRange.normalize(dom, rng);

      normRng.each(function (normRng) {
        setRng(normRng, isForward());
      });

      return normRng.getOr(rng);
    }

    return rng;
  };

    /**
   * Executes callback when the current selection starts/stops matching the specified selector. The current
   * state will be passed to the callback as it's first argument.
   *
   * @method selectorChanged
   * @param {String} selector CSS selector to check for.
   * @param {function} callback Callback with state and args when the selector is matches or not.
   */
  const selectorChanged = (selector: string, callback: (active: boolean, args: { node: Node, selector: String, parents: Element[] }) => void) => {
    selectorChangedWithUnbind(selector, callback);
    return exports;
  };

  const getScrollContainer = (): HTMLElement => {
    let scrollContainer;
    let node = dom.getRoot();

    while (node && node.nodeName !== 'BODY') {
      if (node.scrollHeight > node.clientHeight) {
        scrollContainer = node;
        break;
      }

      node = node.parentNode as HTMLElement;
    }

    return scrollContainer;
  };

  const scrollIntoView = (elm: HTMLElement, alignToTop?: boolean) => ScrollIntoView.scrollElementIntoView(editor, elm, alignToTop);
  const placeCaretAt = (clientX: number, clientY: number) => setRng(CaretRangeFromPoint.fromPoint(clientX, clientY, editor.getDoc()));

  const getBoundingClientRect = (): ClientRect => {
    const rng = getRng();
    return rng.collapsed ? CaretPosition.fromRangeStart(rng).getClientRects()[0] : rng.getBoundingClientRect();
  };

  const destroy = () => {
    win = selectedRange = explicitRange = null;
    controlSelection.destroy();
  };

  const exports = {
    bookmarkManager: null,
    controlSelection: null,
    dom,
    win,
    serializer,
    editor,
    collapse,
    setCursorLocation,
    getContent,
    setContent,
    getBookmark,
    moveToBookmark,
    select,
    isCollapsed,
    isForward,
    setNode,
    getNode,
    getSel,
    setRng,
    getRng,
    getStart,
    getEnd,
    getSelectedBlocks,
    normalize,
    selectorChanged,
    selectorChangedWithUnbind,
    getScrollContainer,
    scrollIntoView,
    placeCaretAt,
    getBoundingClientRect,
    destroy
  };

  bookmarkManager = BookmarkManager(exports);
  controlSelection = ControlSelection(exports, editor);

  exports.bookmarkManager = bookmarkManager;
  exports.controlSelection = controlSelection;

  return exports;
};

export default Selection;
