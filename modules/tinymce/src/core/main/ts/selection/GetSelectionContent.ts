/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import { Content, ContentFormat } from '../content/ContentTypes';
import * as Rtc from '../Rtc';
import { GetSelectionContentArgs } from './GetSelectionContentImpl';

const getContent = (editor: Editor, args: GetSelectionContentArgs = {}): Content => {
  const format: ContentFormat = args.format ? args.format : 'html';

  return Rtc.getSelectedContent(editor, format, args);
};

export { getContent, GetSelectionContentArgs };
