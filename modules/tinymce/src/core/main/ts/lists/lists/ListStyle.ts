import { Arr, Type } from '@ephox/katamari';

import type Editor from '../../api/Editor';

import * as Selection from './Selection';

const clearShadowingItemStyles = (editor: Editor): void => {
  Arr.each(Selection.getSelectedListItems(editor), (item) => {
    const styleType = editor.dom.getStyle(item, 'list-style-type');

    // Keep none intact as TinyMCE uses it for nested lists
    if (Type.isNonNullable(styleType) && styleType !== 'none') {
      editor.dom.setStyle(item, 'list-style-type', '');
    }
  });
};

export {
  clearShadowingItemStyles
};
