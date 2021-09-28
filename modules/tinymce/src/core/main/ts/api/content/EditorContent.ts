/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from '../../api/Editor';
import { Content, GetContentArgs, SetContentArgs } from '../../content/ContentTypes';
import { getContent } from '../../content/GetContent';
import { addDefaultGetFormats } from '../../content/GetContentImpl';
import * as RegisterFormat from '../../content/RegisterFormat';
import { setContent } from '../../content/SetContent';
import { addDefaultSetFormats } from '../../content/SetContentImpl';

interface EditorContent {
  registerFormat: (format: string, formatGetter: GetContentCallback, formatSetter: SetContentCallback) => void;
  get: (args: Partial<GetContentArgs>) => Content;
  set: (content: Content, args?: Partial<SetContentArgs>) => Content;
}

export type GetContentCallback = (editor: Editor, args: GetContentArgs) => Content;
export type SetContentCallback = (editor: Editor, content: Content, args: SetContentArgs) => Content;
export type GetContentRegistry = Cell<Record<string, GetContentCallback>>;
export type SetContentRegistry = Cell<Record<string, SetContentCallback>>;

const EditorContent = (editor: Editor): EditorContent => {
  const setCell: SetContentRegistry = Cell<Record<string, SetContentCallback>>({});
  const getCell: GetContentRegistry = Cell<Record<string, GetContentCallback>>({});

  addDefaultGetFormats(getCell);
  addDefaultSetFormats(setCell);

  const registerFormat = (format: string, formatGetter: GetContentCallback, formatSetter: SetContentCallback): void =>
    RegisterFormat.registerFormat(editor, format, formatGetter, getCell, formatSetter, setCell);

  const set = (content: Content, args?: Partial<SetContentArgs>): Content =>
    setContent(editor, content, args, setCell);

  const get = (args?: Partial<SetContentArgs>): Content =>
    getContent(editor, args, getCell);

  const exports: EditorContent = {
    registerFormat,
    set,
    get
  };

  return exports;
};

export {
  EditorContent,
  GetContentArgs,
  SetContentArgs,
  Content
};
