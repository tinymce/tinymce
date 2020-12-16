/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import * as InsertButtons from './insert/Buttons';
import * as InsertToolbars from './insert/Toolbars';

import * as SelectionToolbars from './selection/Toolbars';

export default () => {
  PluginManager.add('quickbars', (editor) => {
    InsertButtons.setupButtons(editor);
    InsertToolbars.addToEditor(editor);

    SelectionToolbars.addToEditor(editor);
  });
};
