/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { getContent, GetContentArgs } from './GetContent';
import { setContent, SetContentArgs } from './SetContent';
import Node from '../api/html/Node';

type Content = string | Node;

export {
  Content,
  GetContentArgs,
  SetContentArgs,
  setContent,
  getContent
};
