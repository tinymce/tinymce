import { Assertions, Chain, Cursors, Step, StructAssert, Waiter } from '@ephox/agar';
import { Fun } from '@ephox/katamari';

import { Editor } from '../../alien/EditorTypes';
import * as TinyAssertions from '../bdd/TinyAssertions';
import * as TinySelections from '../bdd/TinySelections';

export interface Presence {
  [selector: string]: number;
}

export interface TinyApis {
  getContent: () => string;
  setContent: (html: string) => void;
  setRawContent: (html: string) => void;
  focus: () => void;
  hasFocus: (expected: boolean) => void;
  nodeChanged: () => void;
  assertContent: (expected: string) => void;
  assertContentPresence: (expected: Presence) => void;
  assertContentStructure: (expected: StructAssert) => void;
  assertSelection: (startPath: number[], soffset: number, finishPath: number[], foffset: number) => void;
  setCursor: (elementPath: number[], offset: number) => void;
  setSelectionFrom: (spec: Cursors.CursorSpec | Cursors.RangeSpec) => void;
  setSelection: (startPath: number[], soffset: number, finishPath: number[], foffset: number) => void;
  select: (selector: string, path: number[]) => void;
  deleteSetting: (key: string) => void;
  setSetting: (key: string, value: any) => void;
  execCommand: (command: string, value?: any) => void;

  pTryAssertFocus: (waitTime?: number) => Promise<void>;

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
  sTryAssertFocus: <T> (waitTime?: number) => Step<T, T>;

  cNodeChanged: <T> () => Chain<T, T>;
  cGetContent: <T> () => Chain<T, string>;
}

export const TinyApis = (editor: Editor): TinyApis => {
  const getContent = (): string => editor.getContent();

  const setContent = (html: string): void => {
    editor.setContent(html);
  };

  const setRawContent = (html: string): void => {
    editor.getBody().innerHTML = html;
  };

  const nodeChanged = (): void => {
    editor.nodeChanged();
  };

  const setSelectionFrom = Fun.curry(TinySelections.setSelectionFrom, editor);
  const setCursor = Fun.curry(TinySelections.setCursor, editor);
  const setSelection = Fun.curry(TinySelections.setSelection, editor);
  const select = Fun.curry(TinySelections.select, editor);

  const setSetting = (key: string, value: any): void => {
    editor.settings[key] = value;
  };

  const deleteSetting = (key: string): void => {
    delete editor.settings[key];
  };

  const execCommand = (command: string, value?: any) => {
    editor.execCommand(command, false, value);
  };

  const assertContent = Fun.curry(TinyAssertions.assertContent, editor);
  const assertContentPresence = Fun.curry(TinyAssertions.assertContentPresence, editor);
  const assertContentStructure = Fun.curry(TinyAssertions.assertContentStructure, editor);
  const assertSelection = Fun.curry(TinyAssertions.assertSelection, editor);

  const focus = (): void => {
    editor.focus();
  };

  const hasFocus = (expected: boolean): void => {
    Assertions.assertEq('Assert whether editor hasFocus', expected, editor.hasFocus());
  };

  const sSetContent = <T>(html: string) => Step.sync<T>(() => {
    setContent(html);
  });

  const sSetRawContent = <T>(html: string) => Step.sync<T>(() => {
    setRawContent(html);
  });

  // Has to be thunked, so it can remain polymorphic
  const cNodeChanged = <T>() =>
    Chain.op<T>(nodeChanged);

  const sSetSelectionFrom = <T>(spec: Cursors.CursorSpec | Cursors.RangeSpec) => Step.sync<T>(() => {
    setSelectionFrom(spec);
  });

  const sSetCursor = <T>(elementPath: number[], offset: number) =>
    sSetSelection<T>(elementPath, offset, elementPath, offset);

  const sSetSelection = <T>(startPath: number[], soffset: number, finishPath: number[], foffset: number) => Step.sync<T>(() => {
    setSelection(startPath, soffset, finishPath, foffset);
  });

  const sSetSetting = <T>(key: string, value: any) => Step.sync<T>(() => {
    setSetting(key, value);
  });

  const sDeleteSetting = <T>(key: string) => Step.sync<T>(() => {
    deleteSetting(key);
  });

  const sSelect = <T>(selector: string, path: number[]) => Step.sync<T>(() => {
    TinySelections.select(editor, selector, path);
  });

  const cGetContent = <T>() => Chain.injectThunked<T, string>(getContent);

  const sExecCommand = <T>(command: string, value?: any) => Step.sync<T>(() => {
    execCommand(command, value);
  });

  const sAssertContent = <T>(expected: string) => Step.sync<T>(() => {
    assertContent(expected);
  });

  const sAssertContentPresence = <T>(expected: Presence) => Step.sync<T>(() => {
    assertContentPresence(expected);
  });

  const sAssertContentStructure = <T>(expected: StructAssert) => Step.sync<T>(() => {
    assertContentStructure(expected);
  });

  const sAssertSelection = <T> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => Step.sync<T>(() => {
    assertSelection(startPath, soffset, finishPath, foffset);
  });

  const sFocus = <T>() => Step.sync<T>(focus);

  const sHasFocus = <T>(expected: boolean) => Step.sync<T>(() => {
    hasFocus(expected);
  });

  const sNodeChanged = <T>() => Step.sync<T>(nodeChanged);

  const sTryAssertFocus = <T>(waitTime?: number) => Waiter.sTryUntil<T, T>(
    'Waiting for focus',
    sHasFocus(true),
    50,
    waitTime
  );

  const pTryAssertFocus = (waitTime?: number) =>
    Step.toPromise(sTryAssertFocus<void>(waitTime))(undefined);

  return {
    getContent,
    setContent,
    setRawContent,
    nodeChanged,
    setSelectionFrom,
    setCursor,
    setSelection,
    select,
    setSetting,
    deleteSetting,
    execCommand,
    assertContent,
    assertContentStructure,
    assertContentPresence,
    assertSelection,
    focus,
    hasFocus,

    pTryAssertFocus,

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
    sAssertSelection,
    sTryAssertFocus,
    sFocus,
    sHasFocus,
    sNodeChanged
  };
};
