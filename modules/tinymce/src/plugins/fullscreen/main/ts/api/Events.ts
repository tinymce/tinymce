import Editor from 'tinymce/core/api/Editor';

const fireFullscreenStateChanged = (editor: Editor, state: boolean): void => {
  editor.dispatch('FullscreenStateChanged', { state });
};

export {
  fireFullscreenStateChanged
};
