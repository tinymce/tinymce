/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import Editor from '../api/Editor';
import * as Rtc from '../Rtc';
import { Content, SetContentArgs } from './ContentTypes';
import { SetContentFormatter } from './EditorContent';

export const setContent = (editor: Editor, content: Content, args: Partial<SetContentArgs> = {}, setCell: Cell<Record<string, SetContentFormatter>>): Content =>
  Rtc.setContent(editor, content, args, setCell);
