import { Arr, Type } from '@ephox/katamari';
import { Compare, SugarElement } from '@ephox/sugar';

import { Bookmark } from '../../bookmark/BookmarkTypes';
import CaretPosition from '../../caret/CaretPosition';
import { GetSelectionContentArgs, SetSelectionContentArgs } from '../../content/ContentTypes';
import * as NodeType from '../../dom/NodeType';
import * as ScrollIntoView from '../../dom/ScrollIntoView';
import * as EditorFocus from '../../focus/EditorFocus';
import { ClientRect } from '../../geom/ClientRect';
import * as CaretRangeFromPoint from '../../selection/CaretRangeFromPoint';
import * as EditableRange from '../../selection/EditableRange';
import * as ElementSelection from '../../selection/ElementSelection';
import * as EventProcessRanges from '../../selection/EventProcessRanges';
import * as GetSelectionContent from '../../selection/GetSelectionContent';
import * as MultiRange from '../../selection/MultiRange';
import * as NormalizeRange from '../../selection/NormalizeRange';
import * as SelectionBookmark from '../../selection/SelectionBookmark';
import { hasAnyRanges, moveEndPoint } from '../../selection/SelectionUtils';
import * as SetSelectionContent from '../../selection/SetSelectionContent';
import Editor from '../Editor';
import AstNode from '../html/Node';
import BookmarkManager from './BookmarkManager';
import ControlSelection from './ControlSelection';
import DOMUtils from './DOMUtils';
import RangeUtils from './RangeUtils';
import SelectorChanged from './SelectorChanged';
import DomSerializer from './Serializer';

/**
 * This class handles text and control selection it's an crossbrowser utility class.
 * Consult the TinyMCE API Documentation for more details and examples on how to use this class.
 *
 * @class tinymce.dom.Selection
 * @example
 * // Getting the currently selected node for the active editor
 * alert(tinymce.activeEditor.selection.getNode().nodeName);
 */

const isAttachedToDom = (node: Node): boolean => {
  return !!(node && node.ownerDocument) && Compare.contains(SugarElement.fromDom(node.ownerDocument), SugarElement.fromDom(node));
};

const isValidRange = (rng: Range | undefined | null): rng is Range => {
  if (!rng) {
    return false;
  } else {
    return isAttachedToDom(rng.startContainer) && isAttachedToDom(rng.endContainer);
  }
};

interface EditorSelection {
  bookmarkManager: BookmarkManager;
  controlSelection: ControlSelection;
  dom: DOMUtils;
  win: Window;
  serializer: DomSerializer;
  editor: Editor;
  collapse: (toStart?: boolean) => void;
  setCursorLocation: {
    (node: Node, offset: number): void;
    (): void;
  };
  getContent: {
    (args: { format: 'tree' } & Partial<GetSelectionContentArgs>): AstNode;
    (args?: Partial<GetSelectionContentArgs>): string;
  };
  setContent: (content: string, args?: Partial<SetSelectionContentArgs>) => void;
  getBookmark: (type?: number, normalized?: boolean) => Bookmark;
  moveToBookmark: (bookmark: Bookmark) => void;
  select: (node: Node, content?: boolean) => Node;
  isCollapsed: () => boolean;
  isEditable: () => boolean;
  isForward: () => boolean;
  setNode: (elm: Element) => Element;
  getNode: () => HTMLElement;
  getSel: () => Selection | null;
  setRng: (rng: Range, forward?: boolean) => void;
  getRng: () => Range;
  getStart: (real?: boolean) => Element;
  getEnd: (real?: boolean) => Element;
  getSelectedBlocks: (startElm?: Element, endElm?: Element) => Element[];
  normalize: () => Range;
  selectorChanged: (selector: string, callback: (active: boolean, args: {
    node: Node;
    selector: String;
    parents: Node[];
  }) => void) => EditorSelection;
  selectorChangedWithUnbind: (selector: string, callback: (active: boolean, args: {
    node: Node;
    selector: String;
    parents: Node[];
  }) => void) => { unbind: () => void };
  getScrollContainer: () => HTMLElement | undefined;
  scrollIntoView: (elm?: HTMLElement, alignToTop?: boolean) => void;
  placeCaretAt: (clientX: number, clientY: number) => void;
  getBoundingClientRect: () => ClientRect | DOMRect;
  destroy: () => void;
  expand: (options?: { type: 'word' }) => void;
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
const EditorSelection = (dom: DOMUtils, win: Window, serializer: DomSerializer, editor: Editor): EditorSelection => {
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

    if (Type.isNonNullable(node) && Type.isNonNullable(offset)) {
      rng.setStart(node, offset);
      rng.setEnd(node, offset);
      setRng(rng);
      collapse(false);
    } else {
      moveEndPoint(dom, rng, editor.getBody(), true);
      setRng(rng);
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
   * alert(tinymce.activeEditor.selection.getContent({ format: 'text' }));
   */
  const getContent = (args?: Partial<GetSelectionContentArgs>): any => GetSelectionContent.getContent(editor, args);

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
  const setContent = (content: string, args?: Partial<SetSelectionContentArgs>) => SetSelectionContent.setContent(editor, content, args);

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
   * const bm = tinymce.activeEditor.selection.getBookmark();
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
   * @example
   * // Stores a bookmark of the current selection
   * const bm = tinymce.activeEditor.selection.getBookmark();
   *
   * tinymce.activeEditor.setContent(tinymce.activeEditor.getContent() + 'Some new content');
   *
   * // Restore the selection bookmark
   * tinymce.activeEditor.selection.moveToBookmark(bm);
   */
  const moveToBookmark = (bookmark: Bookmark): void => bookmarkManager.moveToBookmark(bookmark);

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
   * Checks if the current selection’s start and end containers are editable within their parent’s contexts.
   *
   * @method isEditable
   * @return {Boolean} Will be true if the selection is editable and false if it's not editable.
   */
  const isEditable = (): boolean => {
    const rng = getRng();
    const fakeSelectedElements = editor.getBody().querySelectorAll('[data-mce-selected="1"]');

    if (fakeSelectedElements.length > 0) {
      return Arr.forall(fakeSelectedElements, (el) => dom.isEditable(el.parentElement));
    } else {
      return EditableRange.isEditableRange(dom, rng);
    }
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
  const getSel = (): Selection | null => win.getSelection ? win.getSelection() : (win.document as any).selection;

  /**
   * Returns the browsers internal range object.
   *
   * @method getRng
   * @return {Range} Internal browser range object.
   * @see http://www.quirksmode.org/dom/range_intro.html
   * @see http://www.dotvoid.com/2001/03/using-the-range-object-in-mozilla/
   */
  const getRng = (): Range => {
    let rng: Range | undefined;

    const tryCompareBoundaryPoints = (how: number, sourceRange: Range, destinationRange: Range) => {
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

    const doc = win.document;

    if (Type.isNonNullable(editor.bookmark) && !EditorFocus.hasFocus(editor)) {
      const bookmark = SelectionBookmark.getRng(editor);

      if (bookmark.isSome()) {
        return bookmark.map((r) => EventProcessRanges.processRanges(editor, [ r ])[0]).getOr(doc.createRange());
      }
    }

    try {
      const selection = getSel();
      if (selection && !NodeType.isRestrictedNode(selection.anchorNode)) {
        if (selection.rangeCount > 0) {
          rng = selection.getRangeAt(0);
        } else {
          rng = doc.createRange();
        }

        rng = EventProcessRanges.processRanges(editor, [ rng ])[0];
      }
    } catch (ex) {
      // IE throws unspecified error here if TinyMCE is placed in a frame/iframe
    }

    // No range found then create an empty one
    // This can occur when the editor is placed in a hidden container element on Gecko
    if (!rng) {
      rng = doc.createRange();
    }

    // If range is at start of document then move it to start of body
    if (NodeType.isDocument(rng.startContainer) && rng.collapsed) {
      const elm = dom.getRoot();
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
  const setRng = (rng: Range | undefined, forward?: boolean) => {
    if (!isValidRange(rng)) {
      return;
    }

    const sel = getSel();

    const evt = editor.dispatch('SetSelectionRange', { range: rng, forward });
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

    // WebKit edge case selecting images works better using setBaseAndExtent when the image is floated
    if (!rng.collapsed && rng.startContainer === rng.endContainer && sel?.setBaseAndExtent) {
      if (rng.endOffset - rng.startOffset < 2) {
        if (rng.startContainer.hasChildNodes()) {
          const node = rng.startContainer.childNodes[rng.startOffset];
          if (node && node.nodeName === 'IMG') {
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

    editor.dispatch('AfterSetSelectionRange', { range: rng, forward });
  };

  /**
   * Sets the current selection to the specified DOM element.
   *
   * @method setNode
   * @param {Element} elm Element to set as the contents of the selection.
   * @return {Element} Returns the element that got passed in.
   * @example
   * // Inserts a DOM node at current selection/caret location
   * tinymce.activeEditor.selection.setNode(tinymce.activeEditor.dom.create('img', { src: 'some.gif', title: 'some title' }));
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
  const getNode = (): HTMLElement => ElementSelection.getNode(editor.getBody(), getRng());

  const getSelectedBlocks = (startElm?: Element, endElm?: Element) =>
    ElementSelection.getSelectedBlocks(dom, getRng(), startElm, endElm);

  const isForward = (): boolean => {
    const sel = getSel();

    const anchorNode = sel?.anchorNode;
    const focusNode = sel?.focusNode;

    // No support for selection direction then always return true
    if (!sel || !anchorNode || !focusNode || NodeType.isRestrictedNode(anchorNode) || NodeType.isRestrictedNode(focusNode)) {
      return true;
    }

    const anchorRange = dom.createRng();
    const focusRange = dom.createRng();

    try {
      anchorRange.setStart(anchorNode, sel.anchorOffset);
      anchorRange.collapse(true);

      focusRange.setStart(focusNode, sel.focusOffset);
      focusRange.collapse(true);
    } catch (e) {
      // Safari can generate an invalid selection and error. Silently handle it and default to forward.
      // See https://bugs.webkit.org/show_bug.cgi?id=230594.
      return true;
    }

    return anchorRange.compareBoundaryPoints(anchorRange.START_TO_START, focusRange) <= 0;
  };

  const normalize = (): Range => {
    const rng = getRng();
    const sel = getSel();

    if (!MultiRange.hasMultipleRanges(sel) && hasAnyRanges(editor)) {
      const normRng = NormalizeRange.normalize(dom, rng);

      normRng.each((normRng) => {
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
   * @param {Function} callback Callback with state and args when the selector is matches or not.
   */
  const selectorChanged = (selector: string, callback: (active: boolean, args: { node: Node; selector: String; parents: Node[] }) => void) => {
    selectorChangedWithUnbind(selector, callback);
    return exports;
  };

  const getScrollContainer = (): HTMLElement | undefined => {
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

  const scrollIntoView = (elm?: HTMLElement, alignToTop?: boolean) => {
    if (Type.isNonNullable(elm)) {
      ScrollIntoView.scrollElementIntoView(editor, elm, alignToTop);
    } else {
      ScrollIntoView.scrollRangeIntoView(editor, getRng(), alignToTop);
    }
  };

  const placeCaretAt = (clientX: number, clientY: number) =>
    setRng(CaretRangeFromPoint.fromPoint(clientX, clientY, editor.getDoc()));

  const getBoundingClientRect = (): ClientRect | DOMRect => {
    const rng = getRng();
    return rng.collapsed ? CaretPosition.fromRangeStart(rng).getClientRects()[0] : rng.getBoundingClientRect();
  };

  const destroy = () => {
    (win as any) = selectedRange = explicitRange = null;
    controlSelection.destroy();
  };

  /**
   * Expands the selection range to contain the entire word when the selection is collapsed within the word.
   *
   * @method expand
   * @param {Object} options Optional options provided to the expansion. Defaults to { type: 'word' }
   */
  const expand = (options: { type: 'word' } = { type: 'word' }) =>
    setRng(RangeUtils(dom).expand(getRng(), options));

  const exports = {
    dom,
    win,
    serializer,
    editor,
    expand,
    collapse,
    setCursorLocation,
    getContent,
    setContent,
    getBookmark,
    moveToBookmark,
    select,
    isCollapsed,
    isEditable,
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
  } as EditorSelection;

  const bookmarkManager = BookmarkManager(exports);
  const controlSelection = ControlSelection(exports, editor);

  exports.bookmarkManager = bookmarkManager;
  exports.controlSelection = controlSelection;

  return exports;
};

export default EditorSelection;
