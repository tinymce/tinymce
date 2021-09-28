/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { GetContentCallback, GetContentRegistry, SetContentCallback, SetContentRegistry } from '../api/content/EditorContent';
import Editor from '../api/Editor';
import * as Rtc from '../Rtc';

export const registerFormat = (editor: Editor, format: string, formatGetter: GetContentCallback, getCell: GetContentRegistry, formatSetter: SetContentCallback, setCell: SetContentRegistry): void =>
  Rtc.addContentFormat(editor, format, formatGetter, getCell, formatSetter, setCell);
