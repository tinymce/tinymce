import Editor from 'tinymce/core/api/Editor';

const fireSkinLoaded = (editor: Editor) => editor.dispatch('SkinLoaded');

const fireSkinLoadError = (editor: Editor, error: { message: string }) => editor.dispatch('SkinLoadError', error);

const fireResizeEditor = (editor: Editor) => editor.dispatch('ResizeEditor');

const fireBeforeRenderUI = (editor: Editor) => editor.dispatch('BeforeRenderUI');

const fireResizeContent = (editor: Editor, e?: Event) => editor.dispatch('ResizeContent', e);

const fireScrollContent = (editor: Editor, e: Event) => editor.dispatch('ScrollContent', e);

const fireTextColorChange = (editor: Editor, data: { name: string; color: string }) => editor.dispatch('TextColorChange', data);

export {
  fireSkinLoaded,
  fireSkinLoadError,
  fireResizeEditor,
  fireScrollContent,
  fireBeforeRenderUI,
  fireResizeContent,
  fireTextColorChange
};
