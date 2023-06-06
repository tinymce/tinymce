import { Arr, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import VK from '../api/util/VK';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';

const preventSummaryToggle = (editor: Editor): void => {
  editor.on('click', (e) => {
    if (editor.dom.getParent(e.target, 'details')) {
      e.preventDefault();
    }
  });
};

const filterDetails = (editor: Editor): void => {
  editor.parser.addNodeFilter('details', (elms) => {
    const initialStateOption = Options.getDetailsInitialState(editor);
    Arr.each(elms, (details) => {
      if (initialStateOption === 'expanded') {
        details.attr('open', 'open');
      } else if (initialStateOption === 'collapsed') {
        details.attr('open', null);
      }
    });
  });

  editor.serializer.addNodeFilter('details', (elms) => {
    const serializedStateOption = Options.getDetailsSerializedState(editor);
    Arr.each(elms, (details) => {
      if (serializedStateOption === 'expanded') {
        details.attr('open', 'open');
      } else if (serializedStateOption === 'collapsed') {
        details.attr('open', null);
      }
    });
  });
};

const isCaretInTheBeginning = (editor: Editor, element: HTMLElement): boolean =>
  CaretFinder.firstPositionIn(element).exists((pos) => pos.isEqual(CaretPosition.fromRangeStart(editor.selection.getRng())));

const isCaretInTheEnding = (editor: Editor, element: HTMLElement): boolean =>
  CaretFinder.lastPositionIn(element).exists((pos) => pos.isEqual(CaretPosition.fromRangeStart(editor.selection.getRng())));

const removeNode = (editor: Editor, node: Node) => editor.dom.remove(node, false);

const setCaretToPosition = (editor: Editor) => (position: CaretPosition): void => {
  const node = position.getNode();
  if (!Type.isUndefined(node)) {
    editor.selection.setCursorLocation(node, position.offset());
  }
};

const isSummary = (node: Node | null | undefined): boolean => node?.nodeName === 'SUMMARY';
const isDetails = (node: Node | null | undefined): boolean => node?.nodeName === 'DETAILS';

// TINY-9950: Firefox has some situations where its native behavior does not match what we expect, so
// we have to perform Firefox-specific overrides.
const isFirefox = PlatformDetection.detect().browser.isFirefox();

const preventDeletingSummary = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if (e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) {
      const node = editor.selection.getNode();
      const body = editor.getBody();
      const prevNode = new DomTreeWalker(node, body).prev2(true);
      const nextNode = new DomTreeWalker(node, body).next(true);
      const startElement = editor.selection.getStart();
      const endElement = editor.selection.getEnd();
      const isBackspace = e.keyCode === VK.BACKSPACE;
      const isBackspaceAndCaretAtStart = isBackspace && isCaretInTheBeginning(editor, node);
      const isDelete = e.keyCode === VK.DELETE;
      const isDeleteAndCaretAtEnd = isDelete && isCaretInTheEnding(editor, node);
      const isCollapsed = editor.selection.isCollapsed();
      const isEmpty = editor.dom.isEmpty(node);
      const hasPrevNode = Type.isNonNullable(prevNode);
      const hasNextNode = Type.isNonNullable(nextNode);
      const isNotInSummaryAndIsPrevNodeDetails = hasPrevNode && !isSummary(node) && isDetails(prevNode);
      const isDeleteInEmptyNodeAfterAccordion = isDelete && isEmpty && isNotInSummaryAndIsPrevNodeDetails;
      const isBackspaceInEmptyNodeBeforeAccordion = isBackspace && isEmpty && !isSummary(node) && !isDetails(node) && isDetails(nextNode);

      if (
        !isCollapsed && isSummary(startElement) && startElement !== endElement && !Type.isNull(editor.dom.getParent(endElement, 'details'))
        || isCollapsed && (
          (isBackspaceAndCaretAtStart || isDeleteAndCaretAtEnd) && isSummary(node)
          || isBackspaceAndCaretAtStart && isSummary(prevNode)
          || isDeleteAndCaretAtEnd && node === editor.dom.getParent(node, 'details')?.lastChild
          || isDeleteAndCaretAtEnd && isDetails(nextNode) && !isEmpty
          || isFirefox && isDeleteInEmptyNodeAfterAccordion && !hasNextNode
          || isFirefox && isBackspaceInEmptyNodeBeforeAccordion && !hasPrevNode
        )
      ) {
        e.preventDefault();
      } else if (isCollapsed && isBackspaceAndCaretAtStart && isNotInSummaryAndIsPrevNodeDetails) {
        e.preventDefault();
        if (isEmpty) {
          removeNode(editor, node);
        }
        CaretFinder.lastPositionIn(prevNode).each(setCaretToPosition(editor));
      } else if (isFirefox && isCollapsed && isDeleteInEmptyNodeAfterAccordion && hasNextNode) {
        e.preventDefault();
        removeNode(editor, node);
        CaretFinder.firstPositionIn(nextNode).each(setCaretToPosition(editor));
      }
    }
  });
};

const setup = (editor: Editor): void => {
  preventSummaryToggle(editor);
  filterDetails(editor);
  preventDeletingSummary(editor);
};

export {
  setup
};
