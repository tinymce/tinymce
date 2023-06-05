import { Arr, Type } from '@ephox/katamari';

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

const preventDeletingSummary = (editor: Editor): void => {
  editor.on('keydown', (e) => {
    if ((e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) && editor.selection.isCollapsed()) {
      const node = editor.selection.getNode();
      const prevNode = new DomTreeWalker(node, editor.getBody()).prev2(true);
      const startElement = editor.selection.getStart();
      const endElement = editor.selection.getEnd();
      const isCaretAtStart = isCaretInTheBeginning(editor, node);
      const isBackspaceAndCaretAtStart = e.keyCode === VK.BACKSPACE && isCaretAtStart;
      const isDeleteAndCaretAtEnd = e.keyCode === VK.DELETE && isCaretInTheEnding(editor, node);

      if (
        startElement.nodeName === 'SUMMARY' && startElement !== endElement && !Type.isNull(editor.dom.getParent(endElement, 'details'))
        || (isBackspaceAndCaretAtStart || isDeleteAndCaretAtEnd) && node.nodeName === 'SUMMARY'
        || isBackspaceAndCaretAtStart && prevNode?.nodeName === 'SUMMARY'
        || isDeleteAndCaretAtEnd && node === editor.dom.getParent(node, 'details')?.lastChild
      ) {
        e.preventDefault();
      } else if (node.nodeName !== 'SUMMARY' && prevNode?.nodeName === 'DETAILS' && (isBackspaceAndCaretAtStart || e.keyCode === VK.DELETE && isCaretAtStart && editor.dom.isEmpty(node))) {
        e.preventDefault();
        CaretFinder.lastPositionIn(prevNode).each((position) => {
          const node = position.getNode();
          if (!Type.isUndefined(node)) {
            editor.selection.setCursorLocation(node, position.offset());
          }
        });
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
