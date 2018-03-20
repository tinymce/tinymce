import { Editor } from 'tinymce/core/api/Editor';

const isSkinDisabled = function (editor: Editor): boolean {
  return editor.settings.skin === false;
};

export default {
  isSkinDisabled
};