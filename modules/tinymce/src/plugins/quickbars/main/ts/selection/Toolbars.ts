import { Class, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Options from '../api/Options';

const addToEditor = (editor: Editor): void => {
  const isEditable = (node: Element | null): boolean => editor.dom.isEditable(node);
  const isInEditableContext = (el: Element) => isEditable(el.parentElement);
  const isImage = (node: Element): boolean => {
    const isImageFigure = node.nodeName === 'FIGURE' && /image/i.test(node.className);
    const isImage = node.nodeName === 'IMG' || isImageFigure;
    const isPagebreak = Class.has(SugarElement.fromDom(node), 'mce-pagebreak');
    return isImage && isInEditableContext(node) && !isPagebreak;
  };

  const imageToolbarItems = Options.getImageToolbarItems(editor);
  if (imageToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('imageselection', {
      predicate: isImage,
      items: imageToolbarItems,
      position: 'node'
    });
  }

  const textToolbarItems = Options.getTextSelectionToolbarItems(editor);
  if (textToolbarItems.length > 0) {
    editor.ui.registry.addContextToolbar('textselection', {
      predicate: (node) => !isImage(node) && !editor.selection.isCollapsed() && isEditable(node),
      items: textToolbarItems,
      position: 'selection',
      scope: 'editor'
    });
  }
};

export {
  addToEditor
};
