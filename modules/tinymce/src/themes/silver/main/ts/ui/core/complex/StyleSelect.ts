/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Arr, Optional } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { BlockFormat, InlineFormat } from 'tinymce/core/api/fmt/Format';
import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { AdvancedSelectDataset, SelectDataset } from './SelectDatasets';
import { getStyleFormats } from './StyleFormat';
import { findNearest } from './utils/FormatDetection';
import { onActionToggleFormat } from './utils/Utils';

const getSpec = (editor: Editor, dataset: SelectDataset): SelectSpec => {
  const isSelectedFor = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (format: string) => () => {
    const fmt = editor.formatter.get(format);
    return fmt !== undefined ? Optional.some({
      tag: fmt.length > 0 ? (fmt[0] as InlineFormat).inline || (fmt[0] as BlockFormat).block || 'div' : 'div',
      styles: editor.dom.parseStyle(editor.formatter.getCssText(format))
    }) : Optional.none();
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const getFormatItems = (fmt) => {
      const subs = fmt.items;
      return subs !== undefined && subs.length > 0 ? Arr.bind(subs, getFormatItems) : [{ title: fmt.title, format: fmt.format }];
    };
    const flattenedItems = Arr.bind(getStyleFormats(editor), getFormatItems);
    const detectedFormat = findNearest(editor, () => flattenedItems);
    const text = detectedFormat.fold(() => 'Paragraph', (fmt) => fmt.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
  };

  const nodeChangeHandler = Optional.some((comp: AlloyComponent) => () => updateSelectMenuText(comp));

  const setInitialValue = Optional.some((comp: AlloyComponent) => updateSelectMenuText(comp));

  return {
    tooltip: 'Formats',
    icon: Optional.none(),
    isSelectedFor,
    getCurrentValue: Optional.none,
    getPreviewFor,
    onAction: onActionToggleFormat(editor),
    setInitialValue,
    nodeChangeHandler,
    shouldHide: editor.getParam('style_formats_autohide', false, 'boolean'),
    isInvalid: (item) => !editor.formatter.canApply(item.format),
    dataset
  } as SelectSpec;
};

const createStyleSelect = (editor: Editor, backstage: UiFactoryBackstage) => {
  const dataset: AdvancedSelectDataset = { type: 'advanced', ...backstage.styleselect };
  return createSelectButton(editor, backstage, getSpec(editor, dataset));
};

const styleSelectMenu = (editor: Editor, backstage: UiFactoryBackstage) => {
  const dataset: AdvancedSelectDataset = { type: 'advanced', ...backstage.styleselect };
  const menuItems = createMenuItems(editor, backstage, getSpec(editor, dataset));
  editor.ui.registry.addNestedMenuItem('formats', {
    text: 'Formats',
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createStyleSelect, styleSelectMenu };
