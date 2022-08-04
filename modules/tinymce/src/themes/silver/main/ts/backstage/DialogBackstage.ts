import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

export interface UiFactoryBackstageForDialog {
  readonly isDraggableModal: () => boolean;
}

const isDraggableModal = (editor: Editor) => (): boolean => Options.isDraggableModal(editor);

export const DialogBackstage = (editor: Editor): UiFactoryBackstageForDialog => ({
  isDraggableModal: isDraggableModal(editor)
});
