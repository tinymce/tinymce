import Editor from 'tinymce/core/api/Editor';

import * as Events from '../../api/Events';

const fireSkinLoaded = (editor: Editor): VoidFunction => {
  const done = () => {
    editor._skinLoaded = true;
    Events.fireSkinLoaded(editor);
  };

  return () => {
    if (editor.initialized) {
      done();
    } else {
      editor.on('init', done);
    }
  };
};

const fireSkinLoadError = (editor: Editor, err: string) => (): void =>
  Events.fireSkinLoadError(editor, { message: err });

export {
  fireSkinLoaded,
  fireSkinLoadError
};
