import { Assertions, Chain, Cursors, FocusTools, Step, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { document, Node as DomNode, Range } from '@ephox/dom-globals';
import { Element, Hierarchy, Html } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';
import * as TinySelections from '../selection/TinySelections';

export interface Presence {
  [selector: string]: number;
}

export interface TinyApis {
  sSetContent: <T> (html: string) => Step<T, T>;
  sSetRawContent: <T> (html: string) => Step<T, T>;
  sFocus: <T> () => Step<T, T>;
  sNodeChanged: <T> () => Step<T, T>;
  sAssertContent: <T> (expected: string) => Step<T, T>;
  sAssertContentPresence: <T> (expected: Presence) => Step<T, T>;
  sAssertContentStructure: <T> (expected: StructAssert) => Step<T, T>;
  sAssertSelection: <T> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => Step<T, T>;
  sSetCursor: <T> (elementPath: number[], offset: number) => Step<T, T>;
  sSetSelectionFrom: <T> (spec: Cursors.CursorSpec | Cursors.RangeSpec) => Step<T, T>;
  sSetSelection: <T> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => Step<T, T>;
  sSelect: <T> (selector: string, path: number[]) => Step<T, T>;
  sDeleteSetting: <T> (key: string) => Step<T, T>;
  sSetSetting: <T> (key: string, value: any) => Step<T, T>;
  sExecCommand: <T> (command: string, value?: any) => Step<T, T>;
  sTryAssertFocus: <T> () => Step<T, T>;

  cNodeChanged: <T> () => Chain<T, T>;
  cGetContent: <T> () => Chain<T, string>;
}

export const TinyApis = function (editor: Editor): TinyApis {
  const setContent = function (html: string): void {
    editor.setContent(html);
  };

  const sSetContent = function <T> (html: string) {
    return Step.sync<T>(function () {
      setContent(html);
    });
  };

  const sSetRawContent = function <T> (html: string) {
    return Step.sync<T>(function () {
      editor.getBody().innerHTML = html;
    });
  };

  const lazyBody = function (): Element {
    return Element.fromDom(editor.getBody());
  };

  // Has to be thunked, so it can remain polymorphic
  const cNodeChanged = <T> () => Chain.op<T>(function () {
    editor.nodeChanged();
  });

  const cSetDomSelection = Chain.op<Range>(function (range: Range) {
    editor.selection.setRng(range);
  });

  const cSelectElement: Chain<Element, Element> = Chain.op(function (target: Element) {
    editor.selection.select(target.dom());
  });

  const sSetSelectionFrom = function <T> (spec: Cursors.CursorSpec | Cursors.RangeSpec) {
    const path = Cursors.pathFrom(spec);
    return sSetSelection<T>(path.startPath(), path.soffset(), path.finishPath(), path.foffset());
  };

  const sSetCursor = function <T> (elementPath: number[], offset: number) {
    return sSetSelection<T>(elementPath, offset, elementPath, offset);
  };

  const sSetSelection = function <T> (startPath: number[], soffset: number, finishPath: number[], foffset: number): Step<T, T> {
    return Chain.asStep<T, Element>(lazyBody(), [
      TinySelections.cCreateDomSelection(startPath, soffset, finishPath, foffset),
      cSetDomSelection,
      cNodeChanged()
    ]);
  };

  const sSetSetting = function <T> (key: string, value: any): Step<T, T> {
    return Step.sync(function () {
      editor.settings[key] = value;
    });
  };

  const sDeleteSetting = function <T> (key: string): Step<T, T> {
    return Step.sync<T>(function () {
      delete editor.settings[key];
    });
  };

  const sSelect = function <T> (selector: string, path: number[]) {
    return Chain.asStep<T, Element>(lazyBody(), [
      UiFinder.cFindIn(selector),
      Cursors.cFollow(path),
      cSelectElement
    ]);
  };

  const cGetContent = <T> () => Chain.injectThunked<T, string>(() => editor.getContent());

  const sExecCommand = function <T> (command: string, value?: any) {
    return Step.sync<T>(function () {
      editor.execCommand(command, false, value);
    });
  };

  const sAssertContent = function <T> (expected: string) {
    return Chain.asStep<T, any>({}, [
      cGetContent(),
      Assertions.cAssertHtml('Checking TinyMCE content', expected)
    ]);
  };

  const sAssertContentPresence = function <T> (expected: Presence) {
    return Assertions.sAssertPresence<T>(
      () => 'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody()
    );
  };

  const sAssertContentStructure = function <T> (expected: StructAssert) {
    return Assertions.sAssertStructure<T>(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody()
    );
  };

  // const sAssertSelectionFrom = function (expected) {
  // TODO
  // };

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

  const sAssertSelection = function <T> (startPath: number[], soffset: number, finishPath: number[], foffset: number) {
    return Step.sync<T>(function () {
      const actual = editor.selection.getRng();
      assertPath('start', lazyBody(), startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', lazyBody(), finishPath, foffset, actual.endContainer, actual.endOffset);
    });
  };

  const sFocus = <T> () => Step.sync<T>(function () {
    editor.focus();
  });

  const sNodeChanged = <T> () => Step.sync<T>(function () {
    editor.nodeChanged();
  });

  const sTryAssertFocus = <T> () => Waiter.sTryUntil<T, T>(
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
};
