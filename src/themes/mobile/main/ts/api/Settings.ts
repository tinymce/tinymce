import { Editor } from 'tinymce/core/api/Editor';

const isSkinDisabled = function (editor: Editor): boolean {
  return editor.settings.skin === false;
};

const readOnlyOnInit = function (editor) {
  // Intentional short circuit, TODO: implement editor.settings.mobile
  return false;
};

export {
  isSkinDisabled,
  readOnlyOnInit
};