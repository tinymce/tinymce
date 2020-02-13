/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Events from '../../api/Events';
import Editor from 'tinymce/core/api/Editor';

const fireSkinLoaded = (editor: Editor) => {
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

const fireSkinLoadError = (editor: Editor, err: string) => {
  return () => Events.fireSkinLoadError(editor, { message: err });
};

export default {
  fireSkinLoaded,
  fireSkinLoadError
};