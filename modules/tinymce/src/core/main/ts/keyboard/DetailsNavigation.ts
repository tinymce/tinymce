import { Optional } from '@ephox/katamari';

import Editor from '../api/Editor';
import CaretPosition from '../caret/CaretPosition';
import * as LineReader from '../caret/LineReader';

const moveUp = (editor: Editor, details: HTMLDetailsElement, summary: HTMLElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (root.firstChild === details && LineReader.isAtFirstLine(summary, pos)) {
    editor.execCommand('InsertNewBlockBefore');
    return true;
  } else {
    return false;
  }
};

const moveDown = (editor: Editor, details: HTMLDetailsElement): boolean => {
  const rng = editor.selection.getRng();
  const pos = CaretPosition.fromRangeStart(rng);
  const root = editor.getBody();

  if (root.lastChild === details && LineReader.isAtLastLine(details, pos)) {
    editor.execCommand('InsertNewBlockAfter');
    return true;
  } else {
    return false;
  }
};

const move = (editor: Editor, forward: boolean) => {
  if (forward) {
    return Optional.from(editor.dom.getParent<HTMLDetailsElement>(editor.selection.getNode(), 'details'))
      .map((details) => moveDown(editor, details))
      .getOr(false);
  } else {
    return Optional.from(editor.dom.getParent<HTMLElement>(editor.selection.getNode(), 'summary'))
      .bind((summary) => Optional.from(editor.dom.getParent(summary, 'details'))
        .map((details) => moveUp(editor, details, summary))
      ).getOr(false);
  }
};

const moveV = (editor: Editor, forward: boolean): boolean => move(editor, forward);

export {
  moveV
};
