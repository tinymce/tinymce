import { Assertions, Cursors, StructAssert } from '@ephox/agar';
import { Optional } from '@ephox/katamari';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';

import { Editor, GetContentArgs } from '../../alien/EditorTypes';
import { Presence } from '../pipeline/TinyApis';
import { TinyDom } from '../TinyDom';

const assertPath = (label: string, root: SugarElement<Node>, expPath: number[], expOffset: number, actElement: Node, actOffset: number) => {
  const expected = Cursors.calculateOne(root, expPath);
  const message = () => {
    const actual = SugarElement.fromDom(actElement);
    const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
    return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
  };
  Assertions.assertEq(() => 'Assert incorrect for ' + label + '.\n' + message(), true, expected.dom === actElement);
  Assertions.assertEq(() => 'Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
};

const assertContent = (editor: Editor, expected: string, args?: GetContentArgs): void => {
  const content = editor.getContent(args);
  Assertions.assertHtml('Checking TinyMCE content', expected, content);
};

const assertRawContent = (editor: Editor, expected: string): void => {
  const content = editor.getBody().innerHTML;
  Assertions.assertHtml('Checking TinyMCE raw content', expected, content);
};

const assertContentPresence = (editor: Editor, expected: Presence): void => {
  Assertions.assertPresence(
    () => 'Asserting the presence of selectors inside TinyMCE content. Complete list: ' + JSON.stringify(expected) + '\n',
    expected,
    TinyDom.body(editor)
  );
};

const assertContentStructure = (editor: Editor, expected: StructAssert): void => {
  Assertions.assertStructure('Asserting the structure of TinyMCE content.', expected, TinyDom.body(editor));
};

const assertSelection = (editor: Editor, startPath: number[], soffset: number, finishPath: number[], foffset: number): void => {
  const actual = Optional.from(editor.selection.getRng()).getOrDie('Failed to get range');
  const body = TinyDom.body(editor);
  assertPath('start', body, startPath, soffset, actual.startContainer, actual.startOffset);
  assertPath('finish', body, finishPath, foffset, actual.endContainer, actual.endOffset);
};

const assertCursor = (editor: Editor, path: number[], offset: number): void =>
  assertSelection(editor, path, offset, path, offset);

export {
  assertContent,
  assertRawContent,
  assertContentPresence,
  assertContentStructure,
  assertCursor,
  assertSelection
};
