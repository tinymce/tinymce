/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Buttons from './ui/Buttons';

export default (): void => {
  PluginManager.add('advlist', (editor) => {
    if (editor.hasPlugin('lists')) {
      Buttons.register(editor);
      Commands.register(editor);
    } else {
      // eslint-disable-next-line no-console
      console.error('Please use the Lists plugin together with the Advanced List plugin.');
    }
  });
};
