/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Fun } from '@ephox/katamari';
import Templates from '../core/Templates';

const register = function (editor) {
  editor.addCommand('mceInsertTemplate', Fun.curry(Templates.insertTemplate, editor));
};

export default {
  register
};