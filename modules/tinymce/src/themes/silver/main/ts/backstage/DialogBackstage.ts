/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

export interface UiFactoryBackstageForDialog {
  isDraggableModal: () => boolean;
}

const isDraggableModal = (editor: Editor) => (): boolean => Options.isDraggableModal(editor);

export const DialogBackstage = (editor: Editor): UiFactoryBackstageForDialog => ({
  isDraggableModal: isDraggableModal(editor)
});
