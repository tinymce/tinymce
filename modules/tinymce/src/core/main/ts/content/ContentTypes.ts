/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import AstNode from '../api/html/Node';

export type Content = string | AstNode;

export type GetContentFormatter = (editor: Editor, args: GetContentArgs) => Content;
export type SetContentFormatter = (editor: Editor, content: Content, args: SetContentArgs) => Content;

export interface GetContentArgs {
  format?: string;
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
  no_selection?: boolean;
}

export interface InsertContentDetails {
  readonly paste?: boolean;
  readonly merge?: boolean;
  readonly data?: {
    readonly paste: boolean;
  };
}
