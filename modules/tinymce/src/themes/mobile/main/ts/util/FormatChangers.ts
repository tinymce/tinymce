/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

import * as TinyChannels from '../channels/TinyChannels';
import { MobileRealm } from '../ui/IosRealm';

const fontSizesArray: readonly string[] = [ 'x-small', 'small', 'medium', 'large', 'x-large' ];

const fireChange = (realm: MobileRealm, command: string, state: boolean): void => {
  realm.system().broadcastOn([ TinyChannels.formatChanged ], {
    command,
    state
  });
};

const init = (realm: MobileRealm, editor: Editor): void => {
  const allFormats = Obj.keys(editor.formatter.get());
  Arr.each(allFormats, (command) => {
    editor.formatter.formatChanged(command, (state) => {
      fireChange(realm, command, state);
    });
  });

  Arr.each([ 'ul', 'ol' ], (command) => {
    editor.selection.selectorChanged(command, (state, _data) => {
      fireChange(realm, command, state);
    });
  });
};

const fontSizes = Fun.constant(fontSizesArray);

export {
  init,
  fontSizes
};
