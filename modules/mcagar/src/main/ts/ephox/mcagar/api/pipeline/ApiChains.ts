import { Chain, Cursors, StructAssert } from '@ephox/agar';

import { Editor } from '../../alien/EditorTypes';
import * as Options from '../../alien/Options';
import * as TinyAssertions from '../bdd/TinyAssertions';
import * as TinySelections from '../bdd/TinySelections';
import { Presence } from './TinyApis';

export interface ApiChains {
  cNodeChanged: <T extends Editor> () => Chain<T, T>;
  cSetContent: <T extends Editor> (html: string) => Chain<T, T>;
  cSetRawContent: <T extends Editor> (html: string) => Chain<T, T>;
  cSetSelectionFrom: <T extends Editor> (spec: Cursors.CursorSpec | Cursors.RangeSpec) => Chain<T, T>;
  cSetSelection: <T extends Editor> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => Chain<T, T>;
  cSetCursor: <T extends Editor> (elementPath: number[], offset: number) => Chain<T, T>;
  /** @deprecated use cSetOption instead */
  cDeleteSetting: <T extends Editor> (key: string) => Chain<T, T>;
  cUnsetOption: <T extends Editor> (key: string) => Chain<T, T>;
  /** @deprecated use cSetOption instead */
  cSetSetting: <T extends Editor> (key: string, value: any) => Chain<T, T>;
  cSetOption: <T extends Editor> (key: string, value: any) => Chain<T, T>;
  cGetContent: Chain<Editor, string>;
  cExecCommand: <T extends Editor> (command: string, value?: any) => Chain<T, T>;
  cAssertContent: <T extends Editor> (expected: string) => Chain<T, T>;
  cAssertContentPresence: <T extends Editor> (expected: Presence) => Chain<T, T>;
  cAssertContentStructure: <T extends Editor> (expected: StructAssert) => Chain<T, T>;
  cSelect: <T extends Editor> (selector: string, path: number[]) => Chain<T, T>;
  cFocus: Chain<Editor, Editor>;
  cAssertSelection: <T extends Editor> (startPath: number[], soffset: number, finishPath: number[], foffset: number) => Chain<T, T>;
}

const cNodeChanged = <T extends Editor>(): Chain<T, T> => Chain.op((editor: T) => {
  editor.nodeChanged();
});

const cSetContent = <T extends Editor>(html: string): Chain<T, T> => {
  return Chain.op((editor: T) => {
    editor.setContent(html);
  });
};

const cSetRawContent = <T extends Editor>(html: string): Chain<T, T> => {
  return Chain.op((editor: T) => {
    editor.getBody().innerHTML = html;
  });
};

const cSetSelectionFrom = <T extends Editor>(spec: Cursors.CursorSpec | Cursors.RangeSpec): Chain<T, T> => {
  const path = Cursors.pathFrom(spec);
  return cSetSelection(path.startPath, path.soffset, path.finishPath, path.foffset);
};

const cSetCursor = <T extends Editor>(elementPath: number[], offset: number): Chain<T, T> => {
  return cSetSelection(elementPath, offset, elementPath, offset);
};

const cSetSelection = <T extends Editor>(startPath: number[], soffset: number, finishPath: number[], foffset: number): Chain<T, T> => {
  return Chain.op((editor: T) => {
    TinySelections.setSelection(editor, startPath, soffset, finishPath, foffset);
  });
};

const cSetOption = <T extends Editor>(key: string, value: any): Chain<T, T> => {
  return Chain.op((editor: T) => {
    Options.set(editor, key, value);
  });
};

const cUnsetOption = <T extends Editor>(key: string): Chain<T, T> => {
  return Chain.op((editor: T) => {
    Options.unset(editor, key);
  });
};

const cSelect = <T extends Editor>(selector: string, path: number[]): Chain<T, T> => {
  return Chain.op((editor: T) => {
    TinySelections.select(editor, selector, path);
  });
};

const cGetContent: Chain<Editor, string> = Chain.mapper((editor: Editor) => {
  return editor.getContent();
});

const cExecCommand = <T extends Editor>(command: string, value?: any): Chain<T, T> => {
  return Chain.op((editor: T) => {
    editor.execCommand(command, false, value);
  });
};

const cAssertContent = <T extends Editor>(expected: string): Chain<T, T> => {
  return Chain.op((editor: T) => {
    TinyAssertions.assertContent(editor, expected);
  });
};

const cAssertContentPresence = <T extends Editor>(expected: Presence): Chain<T, T> => {
  return Chain.op((editor: T) => {
    TinyAssertions.assertContentPresence(editor, expected);
  });
};

const cAssertContentStructure = <T extends Editor>(expected: StructAssert): Chain<T, T> => {
  return Chain.op((editor: T) => {
    TinyAssertions.assertContentStructure(editor, expected);
  });
};

const cAssertSelection = <T extends Editor>(startPath: number[], soffset: number, finishPath: number[], foffset: number): Chain<T, T> => {
  return Chain.op((editor: T) => {
    TinyAssertions.assertSelection(editor, startPath, soffset, finishPath, foffset);
  });
};

const cFocus = Chain.op((editor: Editor) => {
  editor.focus();
});

export const ApiChains: ApiChains = {
  cSetContent,
  cGetContent,
  cSetSelectionFrom,
  cSetSelection,
  cSetSetting: cSetOption,
  cSetOption,
  cSetRawContent,
  cDeleteSetting: cUnsetOption,
  cUnsetOption,
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
