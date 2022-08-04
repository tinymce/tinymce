import Editor from 'tinymce/core/api/Editor';

const fireSkinLoaded = (editor: Editor): void => {
  editor.dispatch('SkinLoaded');
};

const fireSkinLoadError = (editor: Editor, error: { message: string }): void => {
  editor.dispatch('SkinLoadError', error);
};

const fireResizeEditor = (editor: Editor): void => {
  editor.dispatch('ResizeEditor');
};

const fireResizeContent = (editor: Editor, e?: any): void => {
  editor.dispatch('ResizeContent', e);
};

const fireScrollContent = (editor: Editor, e: any): void => {
  editor.dispatch('ScrollContent', e);
};

const fireTextColorChange = (editor: Editor, data: { name: string; color: string }): void => {
  editor.dispatch('TextColorChange', data);
};

export {
  fireSkinLoaded,
  fireSkinLoadError,
  fireResizeEditor,
  fireScrollContent,
  fireResizeContent,
  fireTextColorChange
};
