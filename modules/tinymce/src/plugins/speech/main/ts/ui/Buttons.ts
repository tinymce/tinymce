/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { Cell } from '@ephox/katamari';
import { console } from '@ephox/dom-globals';

const register = (editor: Editor, actions) => {
  const listening = Cell<Boolean>(false);

  console.log('wut');
  editor.ui.registry.addToggleButton('listen', {
    active: false,
    tooltip: 'lol',
    icon: 'ordered-list',
    onAction: (api) => {
      const curr = listening.get();
      const newz = !curr;
      const f = newz ? actions.start : actions.stop;
      f();
      api.setActive(newz);
      listening.set(newz);
    }
  });
};

export default {
  register
};