/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Tools from 'tinymce/core/api/util/Tools';
import { Editor } from 'tinymce/core/api/Editor';
import Direction from '../core/Direction';
import { Element } from '@ephox/sugar';

const generateSelector = function (dir) {
  const selector = [];

  Tools.each('h1 h2 h3 h4 h5 h6 div p'.split(' '), function (name) {
    selector.push(name + '[dir=' + dir + ']');
  });

  return selector.join(',');
};

const getNodeChangeHandler = (editor, dir) => {
  return (api) => {
    const nodeChangeHandler = (e) => {
      const element = Element.fromDom(e.element);
      api.setActive(Direction.getDir(element) === dir);
    };
    editor.on('nodeChange', nodeChangeHandler);

    return () => editor.off('nodeChange', nodeChangeHandler);
  };
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

export default {
  register
};