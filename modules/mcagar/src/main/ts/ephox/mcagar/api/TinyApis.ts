import { Assertions, Chain, Cursors, FocusTools, Step, UiFinder, Waiter } from '@ephox/agar';
import { Element, Hierarchy, Html } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import TinySelections from '../selection/TinySelections';

export interface Presence {
  [selector: string]: number;
}

export default function (editor) {
  const setContent = function (html: string) {
    editor.setContent(html);
  };

  const sSetContent = function (html: string) {
    return Step.sync(function () {
      setContent(html);
    });
  };

  const sSetRawContent = function (html: string) {
    return Step.sync(function () {
      editor.getBody().innerHTML = html;
    });
  };

  const lazyBody = function () {
    return Element.fromDom(editor.getBody());
  };

  const cNodeChanged = Chain.op(function () {
    editor.nodeChanged();
  });

  const cSetDomSelection = Chain.op(function (range) {
    editor.selection.setRng(range);
  });

  const cSelectElement = Chain.op(function (target: Element) {
    editor.selection.select(target.dom());
  });

  const sSetSelectionFrom = function (spec) {
    const path = Cursors.pathFrom(spec);
    return sSetSelection(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
  };

  const sSetCursor = function (elementPath: number[], offset: number) {
    return sSetSelection(elementPath, offset, elementPath, offset);
  };

  const sSetSelection = function (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
    return Chain.asStep(lazyBody(), [
      TinySelections.cCreateDomSelection(startPath, soffset, finishPath, foffset),
      cSetDomSelection,
      cNodeChanged
    ]);
  };

  const sSetSetting = function (key: string, value) {
    return Step.sync(function () {
      editor.settings[key] = value;
    });
  };

  const sDeleteSetting = function (key: string) {
    return Step.sync(function () {
      delete editor.settings[key];
    });
  };

  const sSelect = function (selector: string, path: number[]) {
    return Chain.asStep(lazyBody(), [
      UiFinder.cFindIn(selector),
      Cursors.cFollow(path),
      cSelectElement
    ]);
  };

  const cGetContent = Chain.mapper(function (input) {
    // Technically not mapping value.
    return editor.getContent();
  });

  const sExecCommand = function (command: string, value?) {
    return Step.sync(function () {
      editor.execCommand(command, false, value);
    });
  };

  const sAssertContent = function (expected: string) {
    return Chain.asStep({}, [
      cGetContent,
      Assertions.cAssertHtml('Checking TinyMCE content', expected)
    ]);
  };

  const sAssertContentPresence = function (expected: Presence) {
    return Assertions.sAssertPresence(
      'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody()
    );
  };

  const sAssertContentStructure = function (expected) {
    return Assertions.sAssertStructure(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody()
    );
  };

  // const sAssertSelectionFrom = function (expected) {
    // TODO
  // };

  const assertPath = function (label: string, root, expPath: number[], expOffset: number, actElement, actOffset: number) {
    const expected = Cursors.calculateOne(root, expPath);
    const message = function () {
      const actual = Element.fromDom(actElement);
      const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
      return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
    };
    Assertions.assertEq('Assert incorrect for ' + label + '.\n' + message(), true, expected.dom() === actElement);
    Assertions.assertEq('Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
  };

  const sAssertSelection = function (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
    return Step.sync(function () {
      const actual = editor.selection.getRng();
      assertPath('start', lazyBody(), startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', lazyBody(), finishPath, foffset, actual.endContainer, actual.endOffset);
    });
  };

  const sFocus = Step.sync(function () {
    editor.focus();
  });

  const sNodeChanged = Step.sync(function () {
    editor.nodeChanged();
  });

  const sTryAssertFocus = Waiter.sTryUntil(
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
    sSetContent,
    cGetContent,
    sSetRawContent,
    cNodeChanged,

    sAssertContent,
    sAssertContentPresence,
    sAssertContentStructure,
    sSetSelectionFrom,
    sSetSelection,
    sSetSetting,
    sDeleteSetting,
    sSetCursor,
    sSelect,
    sExecCommand,
    // sAssertSelectionFrom: sAssertSelectionFrom,
    sAssertSelection,
    sTryAssertFocus,
    sFocus,
    sNodeChanged
  };
}
