/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from '../api/Editor';
import { normalizeNbspsInEditor } from './Nbsps';
import { PlatformDetection } from '@ephox/sand';
import { Throttler } from '@ephox/katamari';

const browser = PlatformDetection.detect().browser;

const setupIeInput = (editor: Editor) => {
  // We need to delay this since the normalization should happen after typing a letter
  // for example typing a<space>b in a paragraph would otherwise result in a a&nbsp;b
  const keypressThrotter = Throttler.first(() => {
    // We only care about non composing inputs since moving the caret or modifying the text node will blow away the IME
    if (!editor.composing) {
      normalizeNbspsInEditor(editor);
    }
  }, 0);

  if (browser.isIE()) {
    // IE doesn't have the input event so we need to fake that with a keypress on IE keypress is only fired on alpha numeric keys
    editor.on('keypress', (_e) => {
      keypressThrotter.throttle();
    });

    editor.on('remove', (_e) => {
      keypressThrotter.cancel();
    });
  }
};

const setup = (editor: Editor) => {
  setupIeInput(editor);

  editor.on('input', (e) => {
    // We only care about non composing inputs since moving the caret or modifying the text node will blow away the IME
    if (e.isComposing === false) {
      normalizeNbspsInEditor(editor);
    }
  });
};

export {
  setup
};