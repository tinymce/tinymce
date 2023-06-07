import { Arr, Singleton, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement } from '@ephox/sugar';

import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import VK from '../api/util/VK';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as DeleteUtils from '../delete/DeleteUtils';
import * as PaddingBr from '../dom/PaddingBr';

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

const isCaretInTheBeginning = (rng: Range, element: HTMLElement): boolean =>
  CaretFinder.firstPositionIn(element).exists((pos) => pos.isEqual(CaretPosition.fromRangeStart(rng)));

const isCaretInTheEnding = (rng: Range, element: HTMLElement): boolean =>
  CaretFinder.lastPositionIn(element).exists((pos) => pos.isEqual(CaretPosition.fromRangeStart(rng)));

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
const platform = PlatformDetection.detect();
const browser = platform.browser;
const isFirefox = browser.isFirefox();
const isSafari = browser.isSafari();
const isMacOS = platform.os.isMacOS();

const preventDeletingSummary = (editor: Editor): void => {
  const summaryAfterShortcutRangedDeletion = Singleton.value<HTMLElement>();

  editor.on('keydown', (e) => {
    if (e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) {
      const node = editor.selection.getNode();
      const body = editor.getBody();
      const prevNode = new DomTreeWalker(node, body).prev2(true);
      const nextNode = new DomTreeWalker(node, body).next(true);
      const startElement = editor.selection.getStart();
      const endElement = editor.selection.getEnd();
      const rng = editor.selection.getRng();
      const isBackspace = e.keyCode === VK.BACKSPACE;
      const isCaretAtStart = isCaretInTheBeginning(rng, node);
      const isBackspaceAndCaretAtStart = isBackspace && isCaretAtStart;
      const isDelete = e.keyCode === VK.DELETE;
      const isDeleteAndCaretAtEnd = isDelete && isCaretInTheEnding(rng, node);
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
          (isBackspaceAndCaretAtStart || isDeleteAndCaretAtEnd || isEmpty) && isSummary(node)
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
      } else if (isSafari && isSummary(node)) {
        // TINY-9951: Safari has a bug where upon pressing Backspace/Delete when the caret is directly within the summary,
        // all content is removed and the caret is prevented from being placed back into the summary.
        if (isMacOS && (e.altKey || e.metaKey) || e.ctrlKey) {
          // Allow ranged deletion by keyboard shortcuts natively, pad summary and relocate caret on keyup if needed
          summaryAfterShortcutRangedDeletion.set(node);
        } else {
          e.preventDefault();
          if (!isCollapsed && rng.startOffset === 0 && rng.endOffset === node.textContent?.length || DeleteUtils.willDeleteLastPositionInElement(isDelete, CaretPosition.fromRangeStart(rng), node)) {
            PaddingBr.fillWithPaddingBr(SugarElement.fromDom(node));
          } else {
            // Wrap all summary children in a temporary container to execute Backspace/Delete there, then unwrap
            const selection = editor.selection.getSel();
            let { anchorNode, anchorOffset, focusNode, focusOffset } = selection ?? {};
            const applySelection = () => {
              if (Type.isNonNullable(anchorNode) && Type.isNonNullable(anchorOffset) && Type.isNonNullable(focusNode) && Type.isNonNullable(focusOffset)) {
                selection?.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
              }
            };
            const updateSelection = () => {
              anchorNode = selection?.anchorNode;
              anchorOffset = selection?.anchorOffset;
              focusNode = selection?.focusNode;
              focusOffset = selection?.focusOffset;
            };

            const container = editor.dom.create('span');
            Arr.each(node.childNodes, (child) => container.appendChild(child));
            node.appendChild(container);
            applySelection();
            editor.execCommand(isBackspace ? 'Delete' : 'ForwardDelete');
            updateSelection();
            Arr.each(container.childNodes, (child) => node.appendChild(child));
            editor.dom.remove(container);
            applySelection();
          }
        }
      }
    }
  });

  if (isSafari) {
    editor.on('keyup', (_) => {
      summaryAfterShortcutRangedDeletion.on((summary) => {
        if (!isSummary(editor.selection.getNode())) {
          PaddingBr.fillWithPaddingBr(SugarElement.fromDom(summary));
          editor.selection.setCursorLocation(summary, 0);
        }
      });
      summaryAfterShortcutRangedDeletion.clear();
    });
  }
};

const setup = (editor: Editor): void => {
  preventSummaryToggle(editor);
  filterDetails(editor);
  preventDeletingSummary(editor);
};

export {
  setup
};
