/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Options from './api/Options';
import * as InsertButtons from './insert/Buttons';
import * as InsertToolbars from './insert/Toolbars';
import * as SelectionToolbars from './selection/Toolbars';

export default (): void => {
  PluginManager.add('quickbars', (editor) => {
    Options.register(editor);
    InsertButtons.setupButtons(editor);
    InsertToolbars.addToEditor(editor);

    SelectionToolbars.addToEditor(editor);
  });
};
