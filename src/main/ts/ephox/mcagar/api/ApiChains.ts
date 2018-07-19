import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import TinySelections from '../selection/TinySelections';
import { Hierarchy } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { Presence } from './TinyApis';

var lazyBody = function (editor) {
  return Element.fromDom(editor.getBody());
};

var cNodeChanged = Chain.op(function (editor: any) {
  editor.nodeChanged();
});

var cSetContent = function (html: string) {
  return Chain.op(function (editor: any) {
    editor.setContent(html);
  });
};

var cSetRawContent = function (html: string) {
  return Chain.op(function (editor: any) {
    editor.getBody().innerHTML = html;
  });
};

var cSetSelectionFrom = function (spec: Cursors.CursorSpec | Cursors.RangeSpec) {
  var path = Cursors.pathFrom(spec);
  return cSetSelection(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
};

var cSetCursor = function (elementPath: number[], offset: number) {
  return cSetSelection(elementPath, offset, elementPath, offset);
};

var cSetSelection = function (startPath, soffset, finishPath, foffset) {
  return Chain.op(function (editor: any) {
    var range = TinySelections.createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
    editor.selection.setRng(range);
    editor.nodeChanged();
  });
};

var cSetSetting = function (key: string, value) {
  return Chain.op(function (editor: any) {
    editor.settings[key] = value;
  });
};

var cDeleteSetting = function (key: string) {
  return Chain.op(function (editor: any) {
    delete editor.settings[key];
  });
};

var cSelect = function (selector: string, path: number[]) {
  return Chain.op(function (editor: any) {
    var container = UiFinder.findIn(lazyBody(editor), selector).getOrDie();
    var target = Cursors.calculateOne(container, path);
    editor.selection.select(target.dom());
  });
};

var cGetContent = Chain.mapper(function (editor: any) {
  return editor.getContent();
});

var cExecCommand = function (command: string, value?) {
  return Chain.op(function (editor: any) {
    editor.execCommand(command, false, value);
  });
};

var cAssertContent = function (expected: string) {
  return Chain.op(function (editor: any) {
    Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
  });
};

var cAssertContentPresence = function (expected: Presence) {
  return Chain.op(function (editor) {
    Assertions.assertPresence(
      'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody(editor)
    );
  });
};

var cAssertContentStructure = function (expected) {
  return Chain.op(function (editor) {
    return Assertions.assertStructure(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody(editor)
    );
  });
};

var assertPath = function (label, root, expPath: number[], expOffset: number, actElement, actOffset: number) {
  var expected = Cursors.calculateOne(root, expPath);
  var message = function () {
    var actual = Element.fromDom(actElement);
    var actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
    return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
  };
  Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
  Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
};

var cAssertSelection = function (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
  return Chain.op(function (editor: any) {
    var actual = editor.selection.getRng();
    assertPath('start', lazyBody(editor), startPath, soffset, actual.startContainer, actual.startOffset);
    assertPath('finish', lazyBody(editor), finishPath, foffset, actual.endContainer, actual.endOffset);
  });
};

var cFocus = Chain.op(function (editor: any) {
  editor.focus();
});

export default {
  cSetContent: cSetContent,
  cGetContent: cGetContent,
  cSetSelectionFrom: cSetSelectionFrom,
  cSetSelection: cSetSelection,
  cSetSetting: cSetSetting,
  cSetRawContent: cSetRawContent,
  cDeleteSetting: cDeleteSetting,
  cSetCursor: cSetCursor,
  cSelect: cSelect,
  cExecCommand: cExecCommand,
  cNodeChanged: cNodeChanged,
  cFocus: cFocus,

  cAssertContent: cAssertContent,
  cAssertContentPresence: cAssertContentPresence,
  cAssertContentStructure: cAssertContentStructure,
  cAssertSelection: cAssertSelection
};