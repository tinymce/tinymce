/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const fireSkinLoaded = (editor): () => void => {
  const done = () => {
    editor._skinLoaded = true;
    editor.fire('SkinLoaded');
  };

  return () => {
    if (editor.initialized) {
      done();
    } else {
      editor.on('init', done);
    }
  };
};

export {
  fireSkinLoaded
};
