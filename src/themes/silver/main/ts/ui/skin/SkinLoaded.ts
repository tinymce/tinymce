/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Events from '../../api/Events';

const fireSkinLoaded = function (editor) {
  const done = function () {
    editor._skinLoaded = true;
    Events.fireSkinLoaded(editor);
  };

  return function () {
    if (editor.initialized) {
      done();
    } else {
      editor.on('init', done);
    }
  };
};

export default {
  fireSkinLoaded
};