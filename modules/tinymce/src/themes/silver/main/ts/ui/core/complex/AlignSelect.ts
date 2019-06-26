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
import { onActionToggleFormat } from './utils/Utils';
import { createMenuItems, createSelectButton, FormatItem, PreviewSpec } from './BespokeSelect';
import { buildBasicStaticDataset } from './SelectDatasets';
import { IsSelectedForType } from './utils/FormatRegister';

const alignMenuItems = [
  { title: 'Left', icon: 'align-left', format: 'alignleft'},
  { title: 'Center', icon: 'align-center', format: 'aligncenter' },
  { title: 'Right', icon: 'align-right', format: 'alignright' },
  { title: 'Justify', icon: 'align-justify', format: 'alignjustify' }
];

const getSpec = (editor: Editor) => {
  const getMatchingValue = (): Option<Partial<FormatItem>> => {
    return  Arr.find(alignMenuItems, (item) => editor.formatter.match(item.format));
  };

  const isSelectedFor: IsSelectedForType = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (format: string) => () => {
    return Option.none<PreviewSpec>();
  };

  const updateSelectMenuIcon = (comp: AlloyComponent) => {
    const match = getMatchingValue();
    const alignment = match.fold(() => 'left', (item) => item.title.toLowerCase());
    AlloyTriggers.emitWith(comp, updateMenuIcon, {
      icon: `align-${alignment}`
    });
  };

  const nodeChangeHandler = Option.some((comp: AlloyComponent) => () => updateSelectMenuIcon(comp));

  const setInitialValue = Option.some((comp) => updateSelectMenuIcon(comp));

  const dataset = buildBasicStaticDataset(alignMenuItems);

  return {
    tooltip: 'Align',
    icon: Option.some('align-left'),
    isSelectedFor,
    getCurrentValue: Fun.constant(Option.none()),
    getPreviewFor,
    onAction: onActionToggleFormat(editor),
    setInitialValue,
    nodeChangeHandler,
    dataset,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  };
};

const createAlignSelect = (editor, backstage) => {
  const spec = getSpec(editor);
  return createSelectButton(editor, backstage, spec.dataset, spec);
};

const alignSelectMenu = (editor: Editor, backstage: UiFactoryBackstage) => {
  const spec = getSpec(editor);
  const menuItems = createMenuItems(editor, backstage, spec.dataset, spec);
  editor.ui.registry.addNestedMenuItem('align', {
    text: backstage.shared.providers.translate('Align'),
    getSubmenuItems: () => menuItems.items.validateItems(menuItems.getStyleItems())
  });
};

export { createAlignSelect, alignSelectMenu };
