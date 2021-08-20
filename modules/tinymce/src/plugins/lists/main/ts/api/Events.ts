/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

import { ListAction } from '../core/ListAction';

export const fireListEvent = (editor: Editor, action: ListAction, element: Node): EditorEvent<{ action: ListAction; element: Node }> =>
  editor.fire('ListMutation', { action, element });
