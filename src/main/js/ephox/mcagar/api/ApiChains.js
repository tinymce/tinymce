import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import TinySelections from '../selection/TinySelections';
import { Hierarchy } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';

var lazyBody = function (editor) {
  return Element.fromDom(editor.getBody());
};

var cNodeChanged = Chain.op(function (editor) {
  editor.nodeChanged();
});

var cSetContent = function (html) {
  return Chain.op(function (editor) {
    editor.setContent(html);
  });
};

var cSetSelectionFrom = function (spec) {
  var path = Cursors.pathFrom(spec);
  return cSetSelection(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
};

var cSetCursor = function (elementPath, offset) {
  return cSetSelection(elementPath, offset, elementPath, offset);
};

var cSetSelection = function (startPath, soffset, finishPath, foffset) {
  return Chain.op(function (editor) {
    var range = TinySelections.createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
    editor.selection.setRng(range);
    editor.nodeChanged();
  });
};

var cSetSetting = function (key, value) {
  return Chain.op(function (editor) {
    editor.settings[key] = value;
  });
};

var cDeleteSetting = function (key) {
  return Chain.op(function (editor) {
    delete editor.settings[key];
  });
};

var cSelect = function (selector, path) {
  return Chain.op(function (editor) {
    var container = UiFinder.findIn(lazyBody(editor), selector).getOrDie();
    var target = Cursors.calculateOne(container, path);
    editor.selection.select(target.dom());
  });
};

var cGetContent = Chain.mapper(function (editor) {
  return editor.getContent();
});

var cExecCommand = function (command, value) {
  return Chain.op(function (editor) {
    editor.execCommand(command, false, value);
  });
};

var cAssertContent = function (expected) {
  return Chain.op(function (editor) {
    Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
  });
};

var cAssertContentPresence = function (expected) {
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

var assertPath = function (label, root, expPath, expOffset, actElement, actOffset) {
  var expected = Cursors.calculateOne(root, expPath);
  var message = function () {
    var actual = Element.fromDom(actElement);
    var actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
    return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
  };
  Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
  Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
};

var cAssertSelection = function (startPath, soffset, finishPath, foffset) {
  return Chain.op(function (editor) {
    var actual = editor.selection.getRng();
    assertPath('start', lazyBody(editor), startPath, soffset, actual.startContainer, actual.startOffset);
    assertPath('finish', lazyBody(editor), finishPath, foffset, actual.endContainer, actual.endOffset);
  });
};

var cFocus = Chain.op(function (editor) {
  editor.focus();
});

export default <any> {
  cSetContent: cSetContent,
  cGetContent: cGetContent,
  cSetSelectionFrom: cSetSelectionFrom,
  cSetSelection: cSetSelection,
  cSetSetting: cSetSetting,
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