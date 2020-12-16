/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import * as FilterContent from './core/FilterContent';

export default () => {
  PluginManager.add('noneditable', (editor) => {
    FilterContent.setup(editor);
  });
};
