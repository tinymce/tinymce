/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import { addDefaultGetFormats } from 'tinymce/core/content/GetContentImpl';
import { addDefaultSetFormats } from 'tinymce/core/content/SetContentImpl';

import Editor from '../api/Editor';
import * as AddFormat from './AddFormat';
import { Content, GetContentArgs, SetContentArgs } from './ContentTypes';
import { getContent } from './GetContent';
import { setContent } from './SetContent';

interface EditorContent {
  addFormat: (format: string, formatGetter: GetContentFormatter, formatSetter: SetContentFormatter) => void;
  get: (args: Partial<GetContentArgs>) => Content;
  set: (content: Content, args?: Partial<SetContentArgs>) => Content;
}

export type GetContentFormatter = (editor: Editor, args: GetContentArgs) => Content;
export type SetContentFormatter = (editor: Editor, content: Content, args: SetContentArgs) => Content;

const EditorContent = (editor: Editor): EditorContent => {
  const setCell: Cell<Record<string, SetContentFormatter>> = Cell<Record<string, SetContentFormatter>>({});
  const getCell: Cell<Record<string, GetContentFormatter>> = Cell<Record<string, GetContentFormatter>>({});

  addDefaultGetFormats(getCell);
  addDefaultSetFormats(setCell);

  const addFormat = (format: string, formatGetter: GetContentFormatter, formatSetter: SetContentFormatter): void =>
    AddFormat.addFormat(editor, format, formatGetter, getCell, formatSetter, setCell);

  const set = (content: Content, args?: Partial<SetContentArgs>): Content =>
    setContent(editor, content, args, setCell);

  const get = (args?: Partial<SetContentArgs>): Content =>
    getContent(editor, args, getCell);

  const exports: EditorContent = {
    addFormat,
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
