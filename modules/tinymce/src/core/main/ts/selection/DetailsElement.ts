import { Arr, Fun, Optional, Optionals, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { SugarElement } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import Editor from '../api/Editor';
import * as Options from '../api/Options';
import VK from '../api/util/VK';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as DeleteUtils from '../delete/DeleteUtils';
import * as NodeType from '../dom/NodeType';
import * as PaddingBr from '../dom/PaddingBr';
import * as FormatUtils from '../fmt/FormatUtils';

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

const emptyNodeContents = (node: Node) => PaddingBr.fillWithPaddingBr(SugarElement.fromDom(node));

const setCaretToPosition = (editor: Editor, position: CaretPosition): void => {
  const node = position.getNode();
  if (!Type.isUndefined(node)) {
    editor.selection.setCursorLocation(node, position.offset());
  }
};

const isEntireNodeSelected = (rng: Range, node: Node): boolean =>
  rng.startOffset === 0 && rng.endOffset === node.textContent?.length;

const platform = PlatformDetection.detect();
const browser = platform.browser;
const os = platform.os;
const isSafari = browser.isSafari();
const isMacOSOriOS = os.isMacOS() || os.isiOS();

interface DetailsElements {
  readonly startSummary: Optional<HTMLElement>;
  readonly startDetails: Optional<HTMLDetailsElement>;
  readonly endDetails: Optional<HTMLDetailsElement>;
}

const isCaretInTheBeginningOf = (caretPos: CaretPosition, element: HTMLElement): boolean =>
  CaretFinder.firstPositionIn(element).exists((pos) => pos.isEqual(caretPos));

const isCaretInTheEndOf = (caretPos: CaretPosition, element: HTMLElement): boolean => {
  return CaretFinder.lastPositionIn(element).exists((pos) => {
    // Summary may or may not have a trailing BR
    if (NodeType.isBr(pos.getNode())) {
      return CaretFinder.prevPosition(element, pos).exists((pos2) => pos2.isEqual(caretPos)) || pos.isEqual(caretPos);
    } else {
      return pos.isEqual(caretPos);
    }
  });
};

const getDetailsElements = (dom: DOMUtils, rng: Range): Optional<DetailsElements> => {
  const startDetails = Optional.from(dom.getParent(rng.startContainer, 'details'));
  const endDetails = Optional.from(dom.getParent(rng.endContainer, 'details'));

  if (startDetails.isSome() || endDetails.isSome()) {
    const startSummary = startDetails.bind((details) => Optional.from(dom.select('summary', details)[0]));
    return Optional.some({ startSummary, startDetails, endDetails });
  } else {
    return Optional.none();
  }
};

const isPartialDelete = (rng: Range, detailsElements: DetailsElements) => {
  const containsStart = (element: HTMLElement) => element.contains(rng.startContainer);
  const containsEnd = (element: HTMLElement) => element.contains(rng.endContainer);
  const startInSummary = detailsElements.startSummary.exists(containsStart);
  const endInSummary = detailsElements.startSummary.exists(containsEnd);
  const isPartiallySelectedDetailsElements = detailsElements.startDetails.forall((startDetails) => detailsElements.endDetails.forall((endDetails) => startDetails !== endDetails));
  const isInPartiallySelectedSummary = (startInSummary || endInSummary) && !(startInSummary && endInSummary);

  return isInPartiallySelectedSummary || isPartiallySelectedDetailsElements;
};

const isCaretAtStartOfSummary = (caretPos: CaretPosition, detailsElements: DetailsElements) =>
  detailsElements.startSummary.exists((summary) => isCaretInTheBeginningOf(caretPos, summary));

const isCaretAtEndOfSummary = (caretPos: CaretPosition, detailsElements: DetailsElements) =>
  detailsElements.startSummary.exists((summary) => isCaretInTheEndOf(caretPos, summary));

const isCaretInFirstPositionInBody = (caretPos: CaretPosition, detailsElements: DetailsElements) =>
  detailsElements.startDetails.exists((details) =>
    CaretFinder.prevPosition(details, caretPos).forall((pos) =>
      detailsElements.startSummary.exists((summary) => !summary.contains(caretPos.container()) && summary.contains(pos.container()))
    )
  );

const isCaretInLastPositionInBody = (root: HTMLElement, caretPos: CaretPosition, detailsElements: DetailsElements) =>
  detailsElements.startDetails.exists((details) =>
    CaretFinder.nextPosition(root, caretPos).forall((pos) =>
      !details.contains(pos.container())
    )
  );

const getParentDetailsElementAtPos = (dom: DOMUtils, pos: CaretPosition) => Optional.from(dom.getParent(pos.container(), 'details'));

const isInDetailsElement = (dom: DOMUtils, pos: CaretPosition) => getParentDetailsElementAtPos(dom, pos).isSome();

const moveCaretToDetailsPos = (editor: Editor, pos: CaretPosition, forward: boolean) => {
  const details = editor.dom.getParent(pos.container(), 'details');

  if (details && !details.open) {
    const summary = editor.dom.select('summary', details)[0];
    if (summary) {
      const newPos = forward ? CaretFinder.firstPositionIn(summary) : CaretFinder.lastPositionIn(summary);
      newPos.each((pos) => setCaretToPosition(editor, pos));
    }
  } else {
    setCaretToPosition(editor, pos);
  }
};

const preventDeleteIntoDetails = (editor: Editor, forward: boolean) => {
  const { dom, selection } = editor;
  const root = editor.getBody();

  if (editor.selection.isCollapsed()) {
    const caretPos = CaretPosition.fromRangeStart(selection.getRng());
    const parentBlock = dom.getParent(caretPos.container(), dom.isBlock);
    const parentDetailsAtCaret = getParentDetailsElementAtPos(dom, caretPos);
    const inEmptyParentBlock = parentBlock && dom.isEmpty(parentBlock);
    const isFirstBlock = Type.isNull(parentBlock?.previousSibling);
    const isLastBlock = Type.isNull(parentBlock?.nextSibling);

    // Pressing backspace or delete in an first or last empty block before or after details
    if (inEmptyParentBlock) {
      const firstOrLast = forward ? isLastBlock : isFirstBlock;
      if (firstOrLast) {
        const isBeforeAfterDetails = CaretFinder.navigate(!forward, root, caretPos).exists((pos) => {
          return isInDetailsElement(dom, pos) && !Optionals.equals(parentDetailsAtCaret, getParentDetailsElementAtPos(dom, pos));
        });

        if (isBeforeAfterDetails) {
          return true;
        }
      }
    }

    return CaretFinder.navigate(forward, root, caretPos).fold(
      Fun.never,
      (pos) => {
        const parentDetailsAtNewPos = getParentDetailsElementAtPos(dom, pos);

        if (isInDetailsElement(dom, pos) && !Optionals.equals(parentDetailsAtCaret, parentDetailsAtNewPos)) {
          if (!forward) {
            moveCaretToDetailsPos(editor, pos, false);
          }

          if (parentBlock && inEmptyParentBlock) {
            if (forward && isFirstBlock) {
              return true;
            } else if (!forward && isLastBlock) {
              return true;
            }

            moveCaretToDetailsPos(editor, pos, forward);
            editor.dom.remove(parentBlock);
          }

          return true;
        } else {
          return false;
        }
      }
    );
  } else {
    return false;
  }
};

const safariDeleteInSummaryAction = (editor: Editor, e: KeyboardEvent): boolean => {
  const selection = editor.selection;
  const node = selection.getNode();
  const rng = selection.getRng();
  const isBackspace = e.keyCode === VK.BACKSPACE;
  const isDelete = e.keyCode === VK.DELETE;
  const isCollapsed = editor.selection.isCollapsed();
  const caretPos = CaretPosition.fromRangeStart(rng);

  if (isSafari && NodeType.isSummary(node)) {
    // TINY-9951: Safari bug, deleting within the summary causes all content to be removed and no caret position to be left
    // https://bugs.webkit.org/show_bug.cgi?id=257745
    if (!isCollapsed && isEntireNodeSelected(rng, node) || DeleteUtils.willDeleteLastPositionInElement(isDelete, caretPos, node)) {
      emptyNodeContents(node);
    } else {
      editor.undoManager.transact(() => {
        // Wrap all summary children in a temporary container to execute Backspace/Delete there, then unwrap
        const sel = selection.getSel();
        let { anchorNode, anchorOffset, focusNode, focusOffset } = sel ?? {};
        const applySelection = () => {
          if (Type.isNonNullable(anchorNode) && Type.isNonNullable(anchorOffset) && Type.isNonNullable(focusNode) && Type.isNonNullable(focusOffset)) {
            sel?.setBaseAndExtent(anchorNode, anchorOffset, focusNode, focusOffset);
          }
        };
        const updateSelection = () => {
          anchorNode = sel?.anchorNode;
          anchorOffset = sel?.anchorOffset;
          focusNode = sel?.focusNode;
          focusOffset = sel?.focusOffset;
        };
        const appendAllChildNodes = (from: Node, to: Node) => {
          Arr.each(from.childNodes, (child) => {
            if (FormatUtils.isNode(child)) {
              to.appendChild(child);
            }
          });
        };

        const container = editor.dom.create('span', { 'data-mce-bogus': 'all' });
        appendAllChildNodes(node, container);
        node.appendChild(container);
        applySelection();
        // Manually perform ranged deletion by keyboard shortcuts
        if (isCollapsed && (isMacOSOriOS && (e.altKey || isBackspace && e.metaKey) || !isMacOSOriOS && e.ctrlKey)) {
          sel?.modify('extend', isBackspace ? 'left' : 'right', e.metaKey ? 'line' : 'word');
        }
        if (!selection.isCollapsed() && isEntireNodeSelected(selection.getRng(), container)) {
          emptyNodeContents(node);
        } else {
          editor.execCommand(isBackspace ? 'Delete' : 'ForwardDelete');
          updateSelection();
          appendAllChildNodes(container, node);
          applySelection();
        }
        editor.dom.remove(container);
      });
    }

    return true;
  }

  return false;

};

const preventDeleteSummaryAction = (editor: Editor, detailElements: DetailsElements, forward: boolean): boolean => {
  const selection = editor.selection;
  const rng = selection.getRng();
  const isCollapsed = editor.selection.isCollapsed();
  const caretPos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (!isCollapsed) {
    return isPartialDelete(rng, detailElements);
  } else if (!forward) {
    return isCaretAtStartOfSummary(caretPos, detailElements) || isCaretInFirstPositionInBody(caretPos, detailElements);
  } else {
    return isCaretAtEndOfSummary(caretPos, detailElements) || isCaretInLastPositionInBody(root, caretPos, detailElements);
  }
};

export const deleteAction = (editor: Editor, forward: boolean): boolean => {
  return getDetailsElements(editor.dom, editor.selection.getRng()).fold(
    () => preventDeleteIntoDetails(editor, forward),
    (detailsElements) => preventDeleteSummaryAction(editor, detailsElements, forward) || preventDeleteIntoDetails(editor, forward)
  );
};

const preventDeletingSummary = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if (e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) {
      if (deleteAction(editor, e.keyCode === VK.DELETE)) {
        e.preventDefault();
      } else if (safariDeleteInSummaryAction(editor, e)) {
        e.preventDefault();
      }
    }
  });
};

export const setup = (editor: Editor): void => {
  preventSummaryToggle(editor);
  filterDetails(editor);
  preventDeletingSummary(editor);
};
