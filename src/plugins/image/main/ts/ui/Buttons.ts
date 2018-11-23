/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu } from '@ephox/bridge';
import { Node } from '@ephox/dom-globals';
import { Element, Node as SugarNode, Traverse } from '@ephox/sugar';
import { Dialog } from './Dialog';
import { isFigure, isImage } from '../core/ImageData';
import { Editor } from 'tinymce/core/api/Editor';

const getRootElement = (elm: Element): Element => {
  return Traverse.parent(elm).filter((parentElm: Element) => SugarNode.name(parentElm) === 'figure').getOr(elm);
};

const register = (editor: Editor) => {
  const makeContextMenuItem = (node: Node): Menu.ContextMenuItem => {
    return {
      text: 'Image',
      icon: 'image',
      onAction: () => {
        // Ensure the figure/image is selected before opening the image edit dialog
        // as some browsers don't do this when right clicking
        const rootElm = getRootElement(Element.fromDom(node));
        editor.selection.select(rootElm.dom());
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
    text: 'Image...',
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