import { Arr } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstageForStyleFormats } from '../../../backstage/StyleFormatsBackstage';

export interface BasicSelectItem {
  readonly title: string;
  readonly format: string;
  readonly icon?: string;
}

export interface BasicSelectDataset {
  readonly type: 'basic';
  readonly data: Array<BasicSelectItem>;
}

export interface AdvancedSelectDataset extends UiFactoryBackstageForStyleFormats {
  readonly type: 'advanced';
}

export type SelectDataset = BasicSelectDataset | AdvancedSelectDataset;

const process = (rawFormats: string[]): BasicSelectItem[] => Arr.map(rawFormats, (item) => {
  let title = item, format = item;
  // Allow text=value block formats
  const values = item.split('=');
  if (values.length > 1) {
    title = values[0];
    format = values[1];
  }

  return { title, format };
});

const buildBasicStaticDataset = (data: Array<BasicSelectItem>): BasicSelectDataset => ({
  type: 'basic',
  data
});

export enum Delimiter {
  SemiColon,
  Space
}

const split = (rawFormats: string, delimiter: Delimiter): string[] => {
  if (delimiter === Delimiter.SemiColon) {
    return rawFormats.replace(/;$/, '').split(';');
  } else {
    return rawFormats.split(' ');
  }
};

const buildBasicSettingsDataset = (editor: Editor, settingName: 'block_formats' | 'font_family_formats' | 'font_size_formats', delimiter: Delimiter): BasicSelectDataset => {
  // eslint-disable-next-line @tinymce/no-direct-editor-options
  const rawFormats = editor.options.get(settingName);
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
