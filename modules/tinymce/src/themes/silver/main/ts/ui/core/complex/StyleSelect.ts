/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Element } from '@ephox/dom-globals';
import { Arr, Fun, Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { getStyleFormats } from 'tinymce/themes/silver/ui/core/complex/StyleFormat';
import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { AdvancedSelectDataset, SelectDataset } from './SelectDatasets';
import { findNearest, getCurrentSelectionParents } from './utils/FormatDetection';
import { onActionToggleFormat } from './utils/Utils';

const getSpec = (editor: Editor, dataset: SelectDataset): SelectSpec => {
  const isSelectedFor = (format: string) => {
    return () => {
      return editor.formatter.match(format);
    };
  };

  const getPreviewFor = (format: string) => () => {
    const fmt = editor.formatter.get(format);
    return fmt !== undefined ? Option.some({
      tag: fmt.length > 0 ? fmt[0].inline || fmt[0].block || 'div' : 'div',
      styleAttr: editor.formatter.getCssText(format)
    }) : Option.none();
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

  const nodeChangeHandler = Option.some((comp: AlloyComponent) => {
    return (e) => updateSelectMenuText(e.parents, comp);
  });

  const setInitialValue = Option.some((comp: AlloyComponent) => {
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
