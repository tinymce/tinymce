import { Arr, Fun, Optional, Type } from '@ephox/katamari';
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

const isInDetailsElement = (dom: DOMUtils, pos: CaretPosition) =>
  Type.isNonNullable(dom.getParent(pos.container(), 'details'));

const moveCaretToDetailsPos = (editor: Editor, pos: CaretPosition) => {
  const details = editor.dom.getParent(pos.container(), 'details');

  if (details && !details.open) {
    const summary = editor.dom.select('summary', details)[0];
    if (summary) {
      CaretFinder.lastPositionIn(summary).each((pos) => setCaretToPosition(editor, pos));
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

    // Prevent backspace/delete if the paragraph is empty and the start or end of it's parent container
    // TODO: Clean this up!
    if (parentBlock && dom.isEmpty(parentBlock)) {
      if (Type.isNull(parentBlock.nextSibling)) {
        const pos = CaretFinder.prevPosition(root, caretPos).filter((pos) => isInDetailsElement(dom, pos));
        if (pos.isSome()) {
          pos.each((pos) => {
            if (!forward) {
              moveCaretToDetailsPos(editor, pos);
            }
          });
          return true;
        }
      } else if (Type.isNull(parentBlock.previousSibling)) {
        const pos = CaretFinder.nextPosition(root, caretPos).filter((pos) => isInDetailsElement(dom, pos));
        if (pos) {
          return true;
        }
      }
    }

    return CaretFinder.navigate(forward, root, caretPos).fold(
      Fun.never,
      (pos) => {
        if (isInDetailsElement(dom, pos)) {
          if (parentBlock && dom.isEmpty(parentBlock)) {
            editor.dom.remove(parentBlock);
          }

          if (!forward) {
            moveCaretToDetailsPos(editor, pos);
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

const preventDeleteSummaryAction = (editor: Editor, detailElements: DetailsElements, e: KeyboardEvent): boolean => {
  const selection = editor.selection;
  const node = selection.getNode();
  const rng = selection.getRng();
  const isBackspace = e.keyCode === VK.BACKSPACE;
  const isDelete = e.keyCode === VK.DELETE;
  const isCollapsed = editor.selection.isCollapsed();
  const caretPos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (!isCollapsed && isPartialDelete(rng, detailElements)) {
    return true;
  } else if (isCollapsed && isBackspace && isCaretAtStartOfSummary(caretPos, detailElements)) {
    return true;
  } else if (isCollapsed && isDelete && isCaretAtEndOfSummary(caretPos, detailElements)) {
    return true;
  } else if (isCollapsed && isBackspace && isCaretInFirstPositionInBody(caretPos, detailElements)) {
    return true;
  } else if (isCollapsed && isDelete && isCaretInLastPositionInBody(root, caretPos, detailElements)) {
    return true;
  } else if (isSafari && NodeType.isSummary(node)) {
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

const preventDeletingSummary = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if (e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) {
      getDetailsElements(editor.dom, editor.selection.getRng()).fold(
        () => {
          if (preventDeleteIntoDetails(editor, e.keyCode === VK.DELETE)) {
            e.preventDefault();
          }
        },
        (detailsElements) => {
          if (preventDeleteSummaryAction(editor, detailsElements, e)) {
            e.preventDefault();
          }
        }
      );
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
