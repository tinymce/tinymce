import Editor from 'tinymce/core/api/Editor';

const option = (name: string) => (editor: Editor) =>
  editor.options.get(name);

const getForcedRootBlock = option('forced_root_block');

export {
  getForcedRootBlock
};
