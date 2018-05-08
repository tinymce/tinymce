/**
 * EditorContent.ts
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2018 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { getContent, GetContentArgs } from './GetContent';
import { setContent, SetContentArgs } from './SetContent';
import Node from 'tinymce/core/api/html/Node';

type Content = string | Node;

export {
  Content,
  GetContentArgs,
  SetContentArgs,
  setContent,
  getContent
};
