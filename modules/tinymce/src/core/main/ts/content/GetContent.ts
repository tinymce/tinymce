/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Rtc from '../Rtc';
import { Content, GetContentArgs } from './ContentTypes';
import { GetContentFormatter } from './EditorContent';

const defaultFormat = 'html';
export const getContent = (editor: Editor, args: Partial<GetContentArgs> = {}, getCell: Cell<Record<string, GetContentFormatter>>): Content => {
  const format = args.format ? args.format : defaultFormat;

  return Rtc.getContent(editor, args, format, getCell);
};
