import { Assertions, Chain, Cursors, UiFinder } from '@ephox/agar';
import TinySelections from '../selection/TinySelections';
import { Element, Hierarchy, Html } from '@ephox/sugar';
import { Presence } from './TinyApis';

const lazyBody = function (editor) {
  return Element.fromDom(editor.getBody());
};

const cNodeChanged = Chain.op(function (editor: any) {
  editor.nodeChanged();
});

const cSetContent = function (html: string) {
  return Chain.op(function (editor: any) {
    editor.setContent(html);
  });
};

const cSetRawContent = function (html: string) {
  return Chain.op(function (editor: any) {
    editor.getBody().innerHTML = html;
  });
};

const cSetSelectionFrom = function (spec: Cursors.CursorSpec | Cursors.RangeSpec) {
  const path = Cursors.pathFrom(spec);
  return cSetSelection(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
};

const cSetCursor = function (elementPath: number[], offset: number) {
  return cSetSelection(elementPath, offset, elementPath, offset);
};

const cSetSelection = function (startPath, soffset, finishPath, foffset) {
  return Chain.op(function (editor: any) {
    const range = TinySelections.createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
    editor.selection.setRng(range);
    editor.nodeChanged();
  });
};

const cSetSetting = function (key: string, value) {
  return Chain.op(function (editor: any) {
    editor.settings[key] = value;
  });
};

const cDeleteSetting = function (key: string) {
  return Chain.op(function (editor: any) {
    delete editor.settings[key];
  });
};

const cSelect = function (selector: string, path: number[]) {
  return Chain.op(function (editor: any) {
    const container = UiFinder.findIn(lazyBody(editor), selector).getOrDie();
    const target = Cursors.calculateOne(container, path);
    editor.selection.select(target.dom());
  });
};

const cGetContent = Chain.mapper(function (editor: any) {
  return editor.getContent();
});

const cExecCommand = function (command: string, value?) {
  return Chain.op(function (editor: any) {
    editor.execCommand(command, false, value);
  });
};

const cAssertContent = function (expected: string) {
  return Chain.op(function (editor: any) {
    Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
  });
};

const cAssertContentPresence = function (expected: Presence) {
  return Chain.op(function (editor) {
    Assertions.assertPresence(
      'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody(editor)
    );
  });
};

const cAssertContentStructure = function (expected) {
  return Chain.op(function (editor) {
    return Assertions.assertStructure(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody(editor)
    );
  });
};

const assertPath = function (label, root, expPath: number[], expOffset: number, actElement, actOffset: number) {
  const expected = Cursors.calculateOne(root, expPath);
  const message = function () {
    const actual = Element.fromDom(actElement);
    const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
    return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
  };
  Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
  Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
};

const cAssertSelection = function (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
  return Chain.op(function (editor: any) {
    const actual = editor.selection.getRng();
    assertPath('start', lazyBody(editor), startPath, soffset, actual.startContainer, actual.startOffset);
    assertPath('finish', lazyBody(editor), finishPath, foffset, actual.endContainer, actual.endOffset);
  });
};

const cFocus = Chain.op(function (editor: any) {
  editor.focus();
});

export default {
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
