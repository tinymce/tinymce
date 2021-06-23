/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Fun, Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { BlockFormat, InlineFormat } from 'tinymce/core/api/fmt/Format';

import { UiFactoryBackstage } from '../../../backstage/Backstage';
import { updateMenuText } from '../../dropdown/CommonDropdown';
import { onActionToggleFormat } from '../ControlUtils';
import { createMenuItems, createSelectButton, SelectSpec } from './BespokeSelect';
import { buildBasicSettingsDataset, Delimiter } from './SelectDatasets';
import { findNearest } from './utils/FormatDetection';

const defaultBlocks = (
  'Paragraph=p;' +
  'Heading 1=h1;' +
  'Heading 2=h2;' +
  'Heading 3=h3;' +
  'Heading 4=h4;' +
  'Heading 5=h5;' +
  'Heading 6=h6;' +
  'Preformatted=pre'
);

const getSpec = (editor: Editor): SelectSpec => {
  const fallbackFormat = 'Paragraph';

  const isSelectedFor = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (format: string) => () => {
    const fmt = editor.formatter.get(format);
    return Optional.some({
      tag: fmt.length > 0 ? (fmt[0] as InlineFormat).inline || (fmt[0] as BlockFormat).block || 'div' : 'div',
      styles: editor.dom.parseStyle(editor.formatter.getCssText(format))
    });
  };

  const updateSelectMenuText = (comp: AlloyComponent) => {
    const detectedFormat = findNearest(editor, () => dataset.data);
    const text = detectedFormat.fold(Fun.constant(fallbackFormat), (fmt) => fmt.title);
    AlloyTriggers.emitWith(comp, updateMenuText, {
      text
    });
  };

  const dataset = buildBasicSettingsDataset(editor, 'block_formats', defaultBlocks, Delimiter.SemiColon);

  return {
    tooltip: 'Blocks',
    text: Optional.some(fallbackFormat),
    icon: Optional.none(),
    isSelectedFor,
    getCurrentValue: Optional.none,
    getPreviewFor,
    onAction: onActionToggleFormat(editor),
    updateText: updateSelectMenuText,
    dataset,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  };
};

const createFormatSelect = (editor: Editor, backstage: UiFactoryBackstage) => createSelectButton(editor, backstage, getSpec(editor));

// FIX: Test this!
const formatSelectMenu = (editor: Editor, backstage: UiFactoryBackstage) => {
  const menuItems = createMenuItems(editor, backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('blockformats', {
    text: 'Blocks',
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createFormatSelect, formatSelectMenu };
