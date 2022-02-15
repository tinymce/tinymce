import { Cursors, UiFinder } from '@ephox/agar';

import { Editor } from '../../alien/EditorTypes';
import { createDomSelection } from '../../selection/SelectionTools';
import { TinyDom } from '../TinyDom';

const setRawSelection = (editor: Editor, startPath: number[], soffset: number, finishPath: number[], foffset: number): void => {
  const rng = createDomSelection(TinyDom.body(editor), startPath, soffset, finishPath, foffset);
  const sel = editor.selection.getSel();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(rng);
  }
};

const setSelection = (editor: Editor, startPath: number[], soffset: number, finishPath: number[], foffset: number, fireNodeChange: boolean = true): void => {
  const rng = createDomSelection(TinyDom.body(editor), startPath, soffset, finishPath, foffset);
  editor.selection.setRng(rng);
  if (fireNodeChange) {
    editor.nodeChanged();
  }
};

const setSelectionFrom = (editor: Editor, spec: Cursors.CursorSpec | Cursors.RangeSpec, fireNodeChange: boolean = true): void => {
  const path = Cursors.pathFrom(spec);
  setSelection(editor, path.startPath, path.soffset, path.finishPath, path.foffset, fireNodeChange);
};

const setCursor = (editor: Editor, elementPath: number[], offset: number, fireNodeChange: boolean = true): void => {
  setSelection(editor, elementPath, offset, elementPath, offset, fireNodeChange);
};

const select = (editor: Editor, selector: string, path: number[]): void => {
  const container = UiFinder.findIn(TinyDom.body(editor), selector).getOrDie();
  const target = Cursors.calculateOne(container, path);
  editor.selection.select(target.dom);
};

export {
  select,
  setCursor,
  setSelection,
  setRawSelection,
  setSelectionFrom
};
