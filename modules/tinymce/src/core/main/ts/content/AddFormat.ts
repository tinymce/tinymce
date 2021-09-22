import { Cell } from '@ephox/katamari';
/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import * as Rtc from '../Rtc';
import { GetContentFormatter, SetContentFormatter } from './EditorContent';

export const addFormat = (editor: Editor, format: string, formatGetter: GetContentFormatter, getCell: Cell<Record<string, GetContentFormatter>>, formatSetter: SetContentFormatter, setCell: Cell<Record<string, SetContentFormatter>>): void =>
  Rtc.addContentFormat(editor, format, formatGetter, getCell, formatSetter, setCell);
