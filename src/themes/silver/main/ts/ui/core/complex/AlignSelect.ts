/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyComponent, AlloyTriggers } from '@ephox/alloy';
import { Arr, Option } from '@ephox/katamari';
import { Editor } from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from 'tinymce/themes/silver/backstage/Backstage';
import { updateMenuIcon } from '../../dropdown/CommonDropdown';
import { createSelectButton, FormatItem, PreviewSpec } from './BespokeSelect';
import { buildBasicStaticDataset } from './SelectDatasets';
import { IsSelectedForType } from './utils/FormatRegister';

const alignMenuItems = [
  { title: 'Left', icon: 'align-left', format: 'alignleft'},
  { title: 'Center', icon: 'align-center', format: 'aligncenter' },
  { title: 'Right', icon: 'align-right', format: 'alignright' },
  { title: 'Justify', icon: 'align-justify', format: 'alignjustify' }
];

const createAlignSelect = (editor: Editor, backstage: UiFactoryBackstage) => {
  const getMatchingValue = (): Option<Partial<FormatItem>> => {
    return  Arr.find(alignMenuItems, (item) => editor.formatter.match(item.format));
  };

  const isSelectedFor: IsSelectedForType = (format: string) => () => editor.formatter.match(format);

  const getPreviewFor = (format: string) => () => {
    return Option.none<PreviewSpec>();
  };

  const onAction = (rawItem) => () => {
    editor.undoManager.transact(() => {
      editor.focus();
      if (editor.formatter.match(rawItem.format)) {
        editor.formatter.remove(rawItem.format);
      } else {
        editor.formatter.apply(rawItem.format);
      }
    });
  };

  const nodeChangeHandler = Option.some((comp: AlloyComponent) => {
    return () => {
      const match = getMatchingValue();
      const alignment = match.fold(() => 'left', (item) => item.title.toLowerCase());
      AlloyTriggers.emitWith(comp, updateMenuIcon, {
        icon: `align-${alignment}`
      });
    };
  });

  const dataset = buildBasicStaticDataset(alignMenuItems);

  return createSelectButton(editor, backstage, dataset, {
    tooltip: 'Align',
    icon: Option.some('align-left'),
    isSelectedFor,
    getPreviewFor,
    onAction,
    nodeChangeHandler,
    shouldHide: false,
    isInvalid: (item) => !editor.formatter.canApply(item.format)
  });
};

export { createAlignSelect };