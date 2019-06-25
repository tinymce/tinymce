/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyTriggers, AlloyComponent } from '@ephox/alloy';
import { Element } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { getStyleFormats } from 'tinymce/themes/silver/ui/core/complex/StyleFormat';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { onActionToggleFormat } from './utils/Utils';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { findNearest, getCurrentSelectionParents } from './utils/FormatDetection';

const getSpec = (editor): SelectSpec => {
  const isSelectedFor = (format) => {
    return () => {
      return editor.formatter.match(format);
    };
  };

  const getPreviewFor = (format) => () => {
    const fmt = editor.formatter.get(format);
    return fmt !== undefined ? Option.some({
      tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
      styleAttr: editor.formatter.getCssText(format)
    }) : Option.none();
  };

  const flatten = (fmt): string[] => {
    const subs = fmt.items;
    return subs !== undefined && subs.length > 0 ? Arr.bind(subs, flatten) : [ fmt.format ];
  };

  const updateSelectMenuText = (parents: Element[], comp: AlloyComponent) => {
    const getFormatItems = (fmt) => {
      const subs = fmt.items;
      return subs !== undefined && subs.length > 0 ? Arr.bind(subs, getFormatItems) : [ { title: fmt.title, format: fmt.format } ];
    };
    const flattenedItems = Arr.bind(getStyleFormats(editor), getFormatItems);
    const detectedFormat = findNearest(editor, () => flattenedItems, parents);
    const text = detectedFormat.fold(() => 'Paragraph', (fmt) => fmt.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
  };

  const nodeChangeHandler = Option.some((comp) => {
    return (e) => updateSelectMenuText(e.parents, comp);
  });

  const setInitialValue = Option.some((comp) => {
    const parents = getCurrentSelectionParents(editor);
    updateSelectMenuText(parents, comp);
  });

  return {
    tooltip: 'Formats',
    icon: Option.none(),
    isSelectedFor,
    getCurrentValue: Fun.constant(Option.none()),
    getPreviewFor,
    onAction: onActionToggleFormat(editor),
    setInitialValue,
    nodeChangeHandler,
    shouldHide: editor.getParam('style_formats_autohide', false, 'boolean'),
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  } as SelectSpec;
};

const createStyleSelect = (editor: Editor, backstage) => {
  // FIX: Not right.
  const data = backstage.styleselect;
  return createSelectButton(editor, backstage, data, getSpec(editor));
};

const styleSelectMenu = (editor: Editor, backstage) => {
  const data = backstage.styleselect;
  const menuItems = createMenuItems(editor, backstage, data, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('formats', {
    text: 'Formats',
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createStyleSelect, styleSelectMenu };
