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

interface GetContentArgsBase {
  format: string;
  get: boolean;
  getInner: boolean;
  no_events?: boolean;
  [key: string]: any;
}

interface SetContentArgsBase {
  format: string;
  set: boolean;
  content: Content;
  no_events?: boolean;
  no_selection?: boolean;
}

export interface GetContentArgs extends GetContentArgsBase {
  content?: Content;
}

export interface SetContentArgs extends SetContentArgsBase {
  content: Content;
}

export interface SelectionSetContentArgs extends SetContentArgsBase {
  content: string;
  selection: boolean;
  contextual?: boolean;
}

export interface GetSelectionContentArgs extends GetContentArgsBase {
  selection: boolean;
  contextual?: boolean;
  content?: string;
}

export interface InsertContentDetails {
  readonly paste?: boolean;
  readonly merge?: boolean;
  readonly data?: {
    readonly paste: boolean;
  };
}
