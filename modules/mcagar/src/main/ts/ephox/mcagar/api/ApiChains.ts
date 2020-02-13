import { Assertions, Chain, Cursors, StructAssert, UiFinder } from '@ephox/agar';
import { Node as DomNode } from '@ephox/dom-globals';
import { Element, Hierarchy, Html } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';
import * as TinySelections from '../selection/TinySelections';
import { Presence } from './TinyApis';

export interface ApiChains {
  cNodeChanged: <T extends Editor> () => Chain<T, T>;
  cSetContent: <T extends Editor> (html: string) => Chain<T, T>;
  cSetRawContent: <T extends Editor> (html: string) => Chain<T, T>;
  cSetSelectionFrom: <T extends Editor> (spec: Cursors.CursorSpec | Cursors.RangeSpec) => Chain<T, T>;
  cSetSelection: <T extends Editor> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => Chain<T, T>;
  cSetCursor: <T extends Editor> (elementPath: number[], offset: number) => Chain<T, T>;
  cDeleteSetting: <T extends Editor> (key: string) => Chain<T, T>;
  cSetSetting: <T extends Editor> (key: string, value: any) => Chain<T, T>;
  cGetContent: Chain<Editor, string>;
  cExecCommand: <T extends Editor> (command: string, value?: any) => Chain<T, T>;
  cAssertContent: <T extends Editor> (expected: string) => Chain<T, T>;
  cAssertContentPresence: <T extends Editor> (expected: Presence) => Chain<T, T>;
  cAssertContentStructure: <T extends Editor> (expected: StructAssert) => Chain<T, T>;
  cSelect: <T extends Editor> (selector: string, path: number[]) => Chain<T, T>;
  cFocus: Chain<Editor, Editor>;
  cAssertSelection: <T extends Editor> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => Chain<T, T>;
}

const lazyBody = function (editor: Editor) {
  return Element.fromDom(editor.getBody());
};

const cNodeChanged = <T extends Editor> (): Chain<T, T> => Chain.op(function (editor: T) {
  editor.nodeChanged();
});

const cSetContent = function <T extends Editor> (html: string): Chain<T, T> {
  return Chain.op(function (editor: T) {
    editor.setContent(html);
  });
};

const cSetRawContent = function <T extends Editor> (html: string): Chain<T, T> {
  return Chain.op(function (editor: T) {
    editor.getBody().innerHTML = html;
  });
};

const cSetSelectionFrom = function <T extends Editor> (spec: Cursors.CursorSpec | Cursors.RangeSpec): Chain<T, T> {
  const path = Cursors.pathFrom(spec);
  return cSetSelection(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
};

const cSetCursor = function <T extends Editor> (elementPath: number[], offset: number): Chain<T, T> {
  return cSetSelection(elementPath, offset, elementPath, offset);
};

const cSetSelection = function <T extends Editor> (startPath: number[], soffset: number, finishPath: number[], foffset: number): Chain<T, T> {
  return Chain.op(function (editor: T) {
    const range = TinySelections.createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
    editor.selection.setRng(range);
    editor.nodeChanged();
  });
};

const cSetSetting = function <T extends Editor> (key: string, value: any): Chain<T, T> {
  return Chain.op(function (editor: T) {
    editor.settings[key] = value;
  });
};

const cDeleteSetting = function <T extends Editor> (key: string): Chain<T, T> {
  return Chain.op(function (editor: T) {
    delete editor.settings[key];
  });
};

const cSelect = function <T extends Editor> (selector: string, path: number[]): Chain<T, T> {
  return Chain.op(function (editor: T) {
    const container = UiFinder.findIn(lazyBody(editor), selector).getOrDie();
    const target = Cursors.calculateOne(container, path);
    editor.selection.select(target.dom());
  });
};

const cGetContent: Chain<Editor, string> = Chain.mapper(function (editor: Editor) {
  return editor.getContent();
});

const cExecCommand = function <T extends Editor> (command: string, value?: any) {
  return Chain.op(function (editor: T) {
    editor.execCommand(command, false, value);
  });
};

const cAssertContent = function <T extends Editor> (expected: string) {
  return Chain.op(function (editor: T) {
    Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
  });
};

const cAssertContentPresence = function <T extends Editor> (expected: Presence) {
  return Chain.op(function (editor: T) {
    Assertions.assertPresence(
      () => 'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody(editor)
    );
  });
};

const cAssertContentStructure = function <T extends Editor> (expected: StructAssert) {
  return Chain.op(function (editor: T) {
    return Assertions.assertStructure(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody(editor)
    );
  });
};

const assertPath = function (label: string, root: Element, expPath: number[], expOffset: number, actElement: DomNode, actOffset: number) {
  const expected = Cursors.calculateOne(root, expPath);
  const message = function () {
    const actual = Element.fromDom(actElement);
    const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
    return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
  };
  Assertions.assertEq(() => 'Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
  Assertions.assertEq(() => 'Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
};

const cAssertSelection = function <T extends Editor> (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
  return Chain.op(function (editor: T) {
    const actual = editor.selection.getRng();
    assertPath('start', lazyBody(editor), startPath, soffset, actual.startContainer, actual.startOffset);
    assertPath('finish', lazyBody(editor), finishPath, foffset, actual.endContainer, actual.endOffset);
  });
};

const cFocus = Chain.op(function (editor: Editor) {
  editor.focus();
});

export const ApiChains: ApiChains = {
  cSetContent,
  cGetContent,
  cSetSelectionFrom,
  cSetSelection,
  cSetSetting,
  cSetRawContent,
  cDeleteSetting,
  cSetCursor,
  cSelect,
  cExecCommand,
  cNodeChanged,
  cFocus,

  cAssertContent,
  cAssertContentPresence,
  cAssertContentStructure,
  cAssertSelection
};
