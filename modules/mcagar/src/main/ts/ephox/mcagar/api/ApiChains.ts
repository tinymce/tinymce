import { Assertions, Chain, Cursors, StructAssert, UiFinder } from '@ephox/agar';
import { Optional } from '@ephox/katamari';
import { Hierarchy, Html, SugarElement } from '@ephox/sugar';
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

const lazyBody = (editor: Editor): SugarElement<HTMLElement> => {
  return SugarElement.fromDom(editor.getBody());
};

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
    const range = TinySelections.createDomSelection(lazyBody(editor), startPath, soffset, finishPath, foffset);
    editor.selection.setRng(range);
    editor.nodeChanged();
  });
};

const cSetSetting = <T extends Editor>(key: string, value: any): Chain<T, T> => {
  return Chain.op((editor: T) => {
    editor.settings[key] = value;
  });
};

const cDeleteSetting = <T extends Editor>(key: string): Chain<T, T> => {
  return Chain.op((editor: T) => {
    delete editor.settings[key];
  });
};

const cSelect = <T extends Editor>(selector: string, path: number[]): Chain<T, T> => {
  return Chain.op((editor: T) => {
    const container = UiFinder.findIn(lazyBody(editor), selector).getOrDie();
    const target = Cursors.calculateOne(container, path);
    editor.selection.select(target.dom);
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
    Assertions.assertHtml('Checking TinyMCE content', expected, editor.getContent());
  });
};

const cAssertContentPresence = <T extends Editor>(expected: Presence): Chain<T, T> => {
  return Chain.op((editor: T) => {
    Assertions.assertPresence(
      () => 'Asserting the presence of selectors inside tiny content. Complete list: ' + JSON.stringify(expected) + '\n',
      expected,
      lazyBody(editor)
    );
  });
};

const cAssertContentStructure = <T extends Editor>(expected: StructAssert): Chain<T, T> => {
  return Chain.op((editor: T) => {
    return Assertions.assertStructure(
      'Asserting the structure of tiny content.',
      expected,
      lazyBody(editor)
    );
  });
};

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

const cAssertSelection = <T extends Editor>(startPath: number[], soffset: number, finishPath: number[], foffset: number): Chain<T, T> => {
  return Chain.op((editor: T) => {
    const actual = Optional.from(editor.selection.getRng()).getOrDie('Failed to get range');
    assertPath('start', lazyBody(editor), startPath, soffset, actual.startContainer, actual.startOffset);
    assertPath('finish', lazyBody(editor), finishPath, foffset, actual.endContainer, actual.endOffset);
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
