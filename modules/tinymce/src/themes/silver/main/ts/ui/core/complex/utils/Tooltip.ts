import Editor from 'tinymce/core/api/Editor';

const getTooltipText = (editor: Editor, prefix: string, value: string): string =>
  editor.translate([ `${prefix} {0}`, value ]);

export {
  getTooltipText
};
