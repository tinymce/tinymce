import { Assertions, Chain, Cursors, Step, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { Optional } from '@ephox/katamari';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
import { Editor } from '../alien/EditorTypes';
import * as TinySelections from '../selection/TinySelections';

export interface Presence {
  [selector: string]: number;
}

export interface TinyApis {
  sSetContent: <T> (html: string) => Step<T, T>;
  sSetRawContent: <T> (html: string) => Step<T, T>;
  sFocus: <T> () => Step<T, T>;
  sHasFocus: <T> (expected: boolean) => Step<T, T>;
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

export const TinyApis = (editor: Editor): TinyApis => {
  const setContent = (html: string): void => {
    editor.setContent(html);
  };

  const sSetContent = <T>(html: string) => {
    return Step.sync<T>(() => {
      setContent(html);
    });
  };

  const sSetRawContent = <T>(html: string) => {
    return Step.sync<T>(() => {
      editor.getBody().innerHTML = html;
    });
  };

  const lazyBody = (): SugarElement => {
    return SugarElement.fromDom(editor.getBody());
  };

  // Has to be thunked, so it can remain polymorphic
  const cNodeChanged = <T>() => Chain.op<T>(() => {
    editor.nodeChanged();
  });

  const cSetDomSelection = Chain.op<Range>((range: Range) => {
    editor.selection.setRng(range);
  });

  const cSelectElement: Chain<SugarElement, SugarElement> = Chain.op((target: SugarElement) => {
    editor.selection.select(target.dom);
  });

  const sSetSelectionFrom = <T>(spec: Cursors.CursorSpec | Cursors.RangeSpec) => {
    const path = Cursors.pathFrom(spec);
    return sSetSelection<T>(path.startPath, path.soffset, path.finishPath, path.foffset);
  };

  const sSetCursor = <T>(elementPath: number[], offset: number) => {
    return sSetSelection<T>(elementPath, offset, elementPath, offset);
  };

  const sSetSelection = <T>(startPath: number[], soffset: number, finishPath: number[], foffset: number): Step<T, T> => {
    return Chain.asStep<T, SugarElement>(lazyBody(), [
      TinySelections.cCreateDomSelection(startPath, soffset, finishPath, foffset),
      cSetDomSelection,
      cNodeChanged()
    ]);
  };

  const sSetSetting = <T>(key: string, value: any): Step<T, T> => {
    return Step.sync(() => {
      editor.settings[key] = value;
    });
  };

  const sDeleteSetting = <T>(key: string): Step<T, T> => {
    return Step.sync<T>(() => {
      delete editor.settings[key];
    });
  };

  const sSelect = <T> (selector: string, path: number[]) => {
    return Chain.asStep<T, SugarElement>(lazyBody(), [
      UiFinder.cFindIn(selector),
      Cursors.cFollow(path),
      cSelectElement
    ]);
  };

  const cGetContent = <T>() => Chain.injectThunked<T, string>(() => editor.getContent());

  const sExecCommand = <T>(command: string, value?: any) => {
    return Step.sync<T>(() => {
      editor.execCommand(command, false, value);
    });
  };

  const sAssertContent = <T>(expected: string) => {
    return Chain.asStep<T, any>({}, [
      cGetContent(),
      Assertions.cAssertHtml('Checking TinyMCE content', expected)
    ]);
  };

  const sAssertContentPresence = <T>(expected: Presence) => {
    return Assertions.sAssertPresence<T>(
      () => 'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody()
    );
  };

  const sAssertContentStructure = <T>(expected: StructAssert) => {
    return Assertions.sAssertStructure<T>(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody()
    );
  };

  // const sAssertSelectionFrom = (expected) => {
  // TODO
  // };

  const assertPath = (label: string, root: SugarElement, expPath: number[], expOffset: number, actElement: Node, actOffset: number) => {
    const expected = Cursors.calculateOne(root, expPath);
    const message = () => {
      const actual = SugarElement.fromDom(actElement);
      const actPath = Hierarchy.path(root, actual).getOrDie('could not find path to root');
      return 'Expected path: ' + JSON.stringify(expPath) + '.\nActual path: ' + JSON.stringify(actPath);
    };
    Assertions.assertEq(() => 'Assert incorrect for ' + label + '.\n' + message(), true, expected.dom === actElement);
    Assertions.assertEq(() => 'Offset mismatch for ' + label + ' in :\n' + Html.getOuter(expected), expOffset, actOffset);
  };

  const sAssertSelection = <T> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => {
    return Step.sync<T>(() => {
      const actual = Optional.from(editor.selection.getRng()).getOrDie('Failed to get range');
      assertPath('start', lazyBody(), startPath, soffset, actual.startContainer, actual.startOffset);
      assertPath('finish', lazyBody(), finishPath, foffset, actual.endContainer, actual.endOffset);
    });
  };

  const sFocus = <T>() => Step.sync<T>(() => {
    editor.focus();
  });

  const sHasFocus = <T>(expected: boolean) => Step.sync<T>(() => {
    Assertions.assertEq('Assert whether editor hasFocus', expected, editor.hasFocus());
  });

  const sNodeChanged = <T>() => Step.sync<T>(() => {
    editor.nodeChanged();
  });

  const sTryAssertFocus = <T>(waitTime?: number) => Waiter.sTryUntil<T, T>(
    'Waiting for focus',
    sHasFocus(true),
    50,
    waitTime
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
    sHasFocus,
    sNodeChanged
  };
};
