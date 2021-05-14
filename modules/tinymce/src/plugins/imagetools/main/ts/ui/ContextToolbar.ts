/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Maybes } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import * as Settings from '../api/Settings';
import * as Actions from '../core/Actions';

const register = (editor: Editor) => {
  editor.ui.registry.addContextToolbar('imagetools', {
    items: Settings.getToolbarItems(editor),
    predicate: (elem) => Maybes.isJust(Actions.getEditableImage(editor, elem)),
    position: 'node',
    scope: 'node'
  });
};

export {
  register
};
