import Editor from 'tinymce/core/api/Editor';

const setup = (editor: Editor): void => {
  editor.on('ResolveName', (e) => {
    let name: string;

    if (e.target.nodeType === 1 && (name = e.target.getAttribute('data-mce-object'))) {
      e.name = name;
    }
  });
};

export {
  setup
};
