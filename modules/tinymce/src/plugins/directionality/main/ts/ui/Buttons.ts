/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Direction, SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const getNodeChangeHandler = (editor: Editor, dir: 'ltr' | 'rtl') => (api) => {
  const nodeChangeHandler = (e) => {
    const element = SugarElement.fromDom(e.element);
    api.setActive(Direction.getDirection(element) === dir);
  };
  editor.on('NodeChange', nodeChangeHandler);

  return () => editor.off('NodeChange', nodeChangeHandler);
};

const register = function (editor: Editor) {
  editor.ui.registry.addToggleButton('ltr', {
    tooltip: 'Left to right',
    icon: 'ltr',
    onAction: () => editor.execCommand('mceDirectionLTR'),
    onSetup: getNodeChangeHandler(editor, 'ltr')
  });

  editor.ui.registry.addToggleButton('rtl', {
    tooltip: 'Right to left',
    icon: 'rtl',
    onAction: () => editor.execCommand('mceDirectionRTL'),
    onSetup: getNodeChangeHandler(editor, 'rtl')
  });
};

export {
  register
};
