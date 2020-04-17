/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Arr, Option, Fun } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { updateMenuIcon } from '../../dropdown/CommonDropdown';
import { createMenuItems, createSelectButton, FormatItem, PreviewSpec, SelectSpec, FormatterFormatItem } from './BespokeSelect';
import { buildBasicStaticDataset } from './SelectDatasets';
import { IsSelectedForType } from './utils/FormatRegister';

const alignMenuItems = [
  { title: 'Left', icon: 'align-left', format: 'alignleft', command: 'JustifyLeft' },
  { title: 'Center', icon: 'align-center', format: 'aligncenter', command: 'JustifyCenter' },
  { title: 'Right', icon: 'align-right', format: 'alignright', command: 'JustifyRight' },
  { title: 'Justify', icon: 'align-justify', format: 'alignjustify', command: 'JustifyFull' }
];

const getSpec = (editor: Editor): SelectSpec => {
  const getMatchingValue = (): Option<Partial<FormatItem>> => Arr.find(alignMenuItems, (item) => editor.formatter.match(item.format));

  const isSelectedFor: IsSelectedForType = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (_format: string) => () => Option.none<PreviewSpec>();

  const updateSelectMenuIcon = (comp: AlloyComponent) => {
    const match = getMatchingValue();
    const alignment = match.fold(() => 'left', (item) => item.title.toLowerCase());
    AlloyTriggers.emitWith(comp, updateMenuIcon, {
      icon: `align-${alignment}`
    });
  };

  const nodeChangeHandler = Option.some((comp: AlloyComponent) => () => updateSelectMenuIcon(comp));

  const setInitialValue = Option.some((comp: AlloyComponent) => updateSelectMenuIcon(comp));

  const dataset = buildBasicStaticDataset(alignMenuItems);

  const onAction = (rawItem: FormatterFormatItem) => () =>
    Arr.find(alignMenuItems, (item) => item.format === rawItem.format)
      .each((item) => editor.execCommand(item.command));

  return {
    tooltip: 'Align',
    icon: Option.some('align-left'),
    isSelectedFor,
    getCurrentValue: Fun.constant(Option.none()),
    getPreviewFor,
    onAction,
    setInitialValue,
    nodeChangeHandler,
    dataset,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  };
};

const createAlignSelect = (editor, backstage: UiFactoryBackstage) => createSelectButton(editor, backstage, getSpec(editor));

const alignSelectMenu = (editor: Editor, backstage: UiFactoryBackstage) => {
  const menuItems = createMenuItems(editor, backstage, getSpec(editor));
  editor.ui.registry.addNestedMenuItem('align', {
    text: backstage.shared.providers.translate('Align'),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createAlignSelect, alignSelectMenu };
