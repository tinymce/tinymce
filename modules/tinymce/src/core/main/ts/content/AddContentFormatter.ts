/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import * as Rtc from '../Rtc';
import { GetContentFormatter, SetContentFormatter } from './ContentTypes';

export const addContentFormatter = (editor: Editor, format: string, formatGetter: GetContentFormatter, formatSetter: SetContentFormatter): void =>
  Rtc.addContentFormatter(editor, format, formatGetter, formatSetter);
