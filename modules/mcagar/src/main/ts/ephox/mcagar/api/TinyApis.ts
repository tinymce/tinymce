import { Assertions } from '@ephox/agar';
import { Chain } from '@ephox/agar';
import { Cursors } from '@ephox/agar';
import { FocusTools } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Waiter } from '@ephox/agar';
import TinySelections from '../selection/TinySelections';
import { Hierarchy } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

export interface Presence {
  [selector:string]: number;
}

export default function (editor) {
  var setContent = function (html: string) {
    editor.setContent(html);
  };

  var sSetContent = function (html: string) {
    return Step.sync(function () {
      setContent(html);
    });
  };

  var sSetRawContent = function (html: string) {
    return Step.sync(function () {
      editor.getBody().innerHTML = html;
    });
  };

  var lazyBody = function () {
    return Element.fromDom(editor.getBody());
  };

  var cNodeChanged = Chain.op(function () {
    editor.nodeChanged();
  });

  var cSetDomSelection = Chain.op(function (range) {
    editor.selection.setRng(range);
  });

  var cSelectElement = Chain.op(function (target: Element) {
    editor.selection.select(target.dom());
  });

  var sSetSelectionFrom = function (spec) {
    var path = Cursors.pathFrom(spec);
    return sSetSelection(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
  };

  var sSetCursor = function (elementPath: number[], offset: number) {
    return sSetSelection(elementPath, offset, elementPath, offset);
  };

  var sSetSelection = function (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
    return Chain.asStep(lazyBody(), [
      TinySelections.cCreateDomSelection(startPath, soffset, finishPath, foffset),
      cSetDomSelection,
      cNodeChanged
    ]);
  };

  var sSetSetting = function (key: string, value) {
    return Step.sync(function () {
      editor.settings[key] = value;
    });
  };

  var sDeleteSetting = function (key: string) {
    return Step.sync(function () {
      delete editor.settings[key];
    });
  };

  var sSelect = function (selector: string, path: number[]) {
    return Chain.asStep(lazyBody(), [
      UiFinder.cFindIn(selector),
      Cursors.cFollow(path),
      cSelectElement
    ]);
  };

  var cGetContent = Chain.mapper(function (input) {
    // Technically not mapping value.
    return editor.getContent();
  });

  var sExecCommand = function (command: string, value?) {
    return Step.sync(function () {
      editor.execCommand(command, false, value);
    });
  };

  var sAssertContent = function (expected: string) {
    return Chain.asStep({}, [
      cGetContent,
      Assertions.cAssertHtml('Checking TinyMCE content', expected)
    ]);
  };

  var sAssertContentPresence = function (expected: Presence) {
    return Assertions.sAssertPresence(
      'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody()
    );
  };

  var sAssertContentStructure = function (expected) {
    return Assertions.sAssertStructure(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody()
    );
  };

  // var sAssertSelectionFrom = function (expected) {
    // TODO
  // };

  var assertPath = function (label: string, root, expPath: number[], expOffset: number, actElement, actOffset: number) {
    var expected = Cursors.calculateOne(root, expPath);
    var message = function () {
      var actual = Element.fromDom(actElement);
      var actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
      return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
    };
    Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
    Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
  };

  var sAssertSelection = function (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
    return Step.sync(function () {
      var actual = editor.selection.getRng();
      assertPath('start', lazyBody(), startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', lazyBody(), finishPath, foffset, actual.endContainer, actual.endOffset);
    });
  };

  var sFocus = Step.sync(function () {
    editor.focus();
  });

  var sNodeChanged = Step.sync(function () {
    editor.nodeChanged();
  });

  var sTryAssertFocus = Waiter.sTryUntil(
    'Waiting for focus on tinymce editor',
    FocusTools.sIsOnSelector(
      'iframe focus',
      Element.fromDom(document),
      'iframe'
    ),
    100,
    1000
  );

  return {
    sSetContent: sSetContent,
    cGetContent: cGetContent,
    sSetRawContent: sSetRawContent,
    cNodeChanged: cNodeChanged,

    sAssertContent: sAssertContent,
    sAssertContentPresence: sAssertContentPresence,
    sAssertContentStructure: sAssertContentStructure,
    sSetSelectionFrom: sSetSelectionFrom,
    sSetSelection: sSetSelection,
    sSetSetting: sSetSetting,
    sDeleteSetting: sDeleteSetting,
    sSetCursor: sSetCursor,
    sSelect: sSelect,
    sExecCommand: sExecCommand,
    // sAssertSelectionFrom: sAssertSelectionFrom,
    sAssertSelection: sAssertSelection,
    sTryAssertFocus: sTryAssertFocus,
    sFocus: sFocus,
    sNodeChanged: sNodeChanged
  };
};