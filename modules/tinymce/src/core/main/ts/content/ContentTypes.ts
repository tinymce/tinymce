/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Node from '../api/html/Node';

export type Content = string | Node;
export type ContentFormat = 'raw' | 'text' | 'html' | 'tree';

export interface GetContentArgs {
  format?: ContentFormat;
  get?: boolean;
  content?: string;
  getInner?: boolean;
  no_events?: boolean;
  [key: string]: any;
}

export interface SetContentArgs {
  format?: string;
  set?: boolean;
  content?: string;
  no_events?: boolean;
}
