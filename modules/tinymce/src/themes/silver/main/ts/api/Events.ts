import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

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

const fireAfterProgressState = (editor: Editor, state: boolean): void => {
  editor.dispatch('AfterProgressState', { state });
};

const fireResolveName = (editor: Editor, node: Node): EditorEvent<{ name: string; target: Node }> =>
  editor.dispatch('ResolveName', {
    name: node.nodeName.toLowerCase(),
    target: node
  });

const fireToggleToolbarDrawer = (editor: Editor, state: boolean): void => {
  editor.dispatch('ToggleToolbarDrawer', { state });
};

export {
  fireSkinLoaded,
  fireSkinLoadError,
  fireResizeEditor,
  fireScrollContent,
  fireResizeContent,
  fireTextColorChange,
  fireAfterProgressState,
  fireResolveName,
  fireToggleToolbarDrawer
};
