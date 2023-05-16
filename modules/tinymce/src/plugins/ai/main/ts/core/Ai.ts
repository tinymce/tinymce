import Editor from 'tinymce/core/api/Editor';

const execAi = (editor: Editor): void => {
  editor.insertContent('Hello AI!');
};

export {
  execAi
};
