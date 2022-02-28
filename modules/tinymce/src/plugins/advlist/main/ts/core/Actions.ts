import Editor from 'tinymce/core/api/Editor';

const applyListFormat = (editor: Editor, listName: string, styleValue: false | string): void => {
  const cmd = listName === 'UL' ? 'InsertUnorderedList' : 'InsertOrderedList';
  editor.execCommand(cmd, false, styleValue === false ? null : { 'list-style-type': styleValue });
};

export {
  applyListFormat
};
