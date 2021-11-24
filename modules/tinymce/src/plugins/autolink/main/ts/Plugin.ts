/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Options from './api/Options';
import * as Keys from './core/Keys';

export default (): void => {
  PluginManager.add('autolink', (editor) => {
    Options.register(editor);
    Keys.setup(editor);
  });
};
