/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { SelectData } from './BespokeSelect';

const process = (rawFormats): Array<{ title: string; format: string}> => Arr.map(rawFormats, (item) => {
  let title = item, format = item;
  // Allow text=value block formats
  const values = item.split('=');
  if (values.length > 1) {
    title = values[0];
    format = values[1];
  }

  return { title, format };
});

export interface BasicSelectItem {
  title: string;
  format: string;
  icon?: string;
}

export interface BasicSelectDataset {
  type: 'basic';
  data: Array<BasicSelectItem>;
}

export interface AdvancedSelectDataset extends SelectData {
  type: 'advanced';
}

export type SelectDataset = BasicSelectDataset | AdvancedSelectDataset;

const buildBasicStaticDataset = (data: Array<BasicSelectItem>): BasicSelectDataset => ({
  type: 'basic',
  data
});

export enum Delimiter { SemiColon, Space }

const split = (rawFormats: string, delimiter: Delimiter): string[] => {
  if (delimiter === Delimiter.SemiColon) {
    return rawFormats.replace(/;$/, '').split(';');
  } else {
    return rawFormats.split(' ');
  }
};

const buildBasicSettingsDataset = (editor: Editor, settingName: string, defaults: string, delimiter: Delimiter): BasicSelectDataset => {
  const rawFormats = editor.getParam(settingName, defaults, 'string');
  const data = process(split(rawFormats, delimiter));
  return {
    type: 'basic',
    data
  };
};

export {
  buildBasicSettingsDataset,
  buildBasicStaticDataset
};
