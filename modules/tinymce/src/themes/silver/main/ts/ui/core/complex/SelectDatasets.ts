import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstageForStyleFormats } from '../../../backstage/StyleFormatsBackstage';
import { BasicSelectItem, Delimiter, makeBasicSelectItems } from './utils/Select';

export interface BasicSelectDataset {
  readonly type: 'basic';
  readonly data: Array<BasicSelectItem>;
}

export interface AdvancedSelectDataset extends UiFactoryBackstageForStyleFormats {
  readonly type: 'advanced';
}

export type SelectDataset = BasicSelectDataset | AdvancedSelectDataset;

const buildBasicStaticDataset = (data: Array<BasicSelectItem>): BasicSelectDataset => ({
  type: 'basic',
  data
});

const buildBasicSettingsDataset = (editor: Editor, settingName: 'block_formats' | 'font_family_formats' | 'font_size_formats', delimiter: Delimiter): BasicSelectDataset => {
  // eslint-disable-next-line @tinymce/no-direct-editor-options
  const rawFormats = editor.options.get(settingName);
  const data = makeBasicSelectItems(rawFormats, delimiter);
  return {
    type: 'basic',
    data,
  };
};

export {
  buildBasicSettingsDataset,
  buildBasicStaticDataset,
  Delimiter,
  BasicSelectItem
};
