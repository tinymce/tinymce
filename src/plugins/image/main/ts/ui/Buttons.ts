/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Menu } from '@ephox/bridge';
import { Node } from '@ephox/dom-globals';
import { Element, Node as SugarNode, Traverse } from '@ephox/sugar';
import { Dialog } from './Dialog';
import { isFigure, isImage } from '../core/ImageData';
import { Editor } from 'tinymce/core/api/Editor';

const register = (editor: Editor) => {
  const makeContextMenuItem = (node: Node): Menu.ContextMenuItem => {
    return {
      text: 'Image',
      icon: 'image',
      onAction: () => {
        // Ensure the image is selected before opening the image edit dialog
        // as some browsers don't do this when right clicking
        Traverse.parent(Element.fromDom(node)).filter((elm: Element) => SugarNode.name(elm) === 'figure').fold(
          () => editor.selection.select(node),
          (elm: Element) => editor.selection.select(elm.dom())
        );
        // Open the dialog now that the image is selected
        Dialog(editor).open();
      }
    };
  };

  editor.ui.registry.addToggleButton('image', {
    icon: 'image',
    tooltip: 'Insert/edit image',
    onAction: Dialog(editor).open,
    onSetup: (buttonApi) => editor.selection.selectorChangedWithUnbind('img:not([data-mce-object],[data-mce-placeholder]),figure.image', buttonApi.setActive).unbind
  });

  editor.ui.registry.addMenuItem('image', {
    icon: 'image',
    text: 'Image',
    onAction: Dialog(editor).open
  });

  editor.ui.registry.addContextMenu('image', {
    update: (element: Node): Menu.ContextMenuItem[] => {
      return isFigure(element) || isImage(element) ? [makeContextMenuItem(element)] : [];
    }
  });

};

export default {
  register
};