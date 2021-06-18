/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import Editor from 'tinymce/core/api/Editor';

const platform = PlatformDetection.detect();
/* At the moment, this is only going to be used for Android. The Google keyboard
 * that comes with Android seems to shift the selection when the editor gets blurred
 * to the end of the word. This function rectifies that behaviour
 *
 * See fiddle: http://fiddle.tinymce.com/xNfaab/3 or http://fiddle.tinymce.com/xNfaab/4
 */
const preserve = (f: () => void, editor: Editor): void => {
  const rng = editor.selection.getRng();
  f();
  editor.selection.setRng(rng);
};

const forAndroid = (editor: Editor, f: () => void): void => {
  const wrapper = platform.os.isAndroid() ? preserve : Fun.apply;
  wrapper(f, editor);
};

export {
  forAndroid
};
