/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { ListAction } from '../core/ListAction';

export const fireListEvent = (editor: Editor, action: ListAction, element) => editor.fire('ListMutation', { action, element });
