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
    if (e.keyCode === VK.BACKSPACE || e.keyCode === VK.DELETE) {
      const node = editor.selection.getNode();
      const body = editor.getBody();
      const prevNode = new DomTreeWalker(node, body).prev2(true);
      const startElement = editor.selection.getStart();
      const endElement = editor.selection.getEnd();
      const isBackspaceAndCaretAtStart = e.keyCode === VK.BACKSPACE && isCaretInTheBeginning(editor, node);
      const isDeleteAndCaretAtEnd = e.keyCode === VK.DELETE && isCaretInTheEnding(editor, node);
      const isCollapsed = editor.selection.isCollapsed();
      const isEmpty = editor.dom.isEmpty(node);

      if (
        !isCollapsed && startElement.nodeName === 'SUMMARY' && startElement !== endElement && !Type.isNull(editor.dom.getParent(endElement, 'details'))
        || isCollapsed && (
          (isBackspaceAndCaretAtStart || isDeleteAndCaretAtEnd) && node.nodeName === 'SUMMARY'
          || isBackspaceAndCaretAtStart && prevNode?.nodeName === 'SUMMARY'
          || isDeleteAndCaretAtEnd && node === editor.dom.getParent(node, 'details')?.lastChild
          || isDeleteAndCaretAtEnd && new DomTreeWalker(node, body).next(true)?.nodeName === 'DETAILS' && !isEmpty
        )
      ) {
        e.preventDefault();
      } else if (isCollapsed && isBackspaceAndCaretAtStart && node.nodeName !== 'SUMMARY' && prevNode?.nodeName === 'DETAILS') {
        e.preventDefault();
        if (isEmpty) {
          editor.dom.remove(node, false);
        }
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
