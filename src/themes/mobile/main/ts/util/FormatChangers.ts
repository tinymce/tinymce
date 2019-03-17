/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

import TinyChannels from '../channels/TinyChannels';

const fontSizes = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

const fireChange = function (realm, command, state) {
  realm.system().broadcastOn([ TinyChannels.formatChanged() ], {
    command,
    state
  });
};

const init = function (realm, editor: Editor) {
  const allFormats = Obj.keys(editor.formatter.get());
  Arr.each(allFormats, function (command) {
    editor.formatter.formatChanged(command, function (state) {
      fireChange(realm, command, state);
    });
  });

  Arr.each([ 'ul', 'ol' ], function (command) {
    editor.selection.selectorChanged(command, function (state, data) {
      fireChange(realm, command, state);
    });
  });
};

export default {
  init,
  fontSizes: Fun.constant(fontSizes)
};