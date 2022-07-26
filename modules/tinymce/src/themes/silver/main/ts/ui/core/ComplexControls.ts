import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { createAlignMenu } from './complex/AlignBespoke';
import { createBlocksMenu } from './complex/BlocksBespoke';
import { createFontFamilyMenu } from './complex/FontFamilyBespoke';
import { createFontSizeMenu } from './complex/FontSizeBespoke';
import { createStylesMenu } from './complex/StylesBespoke';

const register = (editor: Editor, backstage: UiFactoryBackstage): void => {
  createAlignMenu(editor, backstage);
  createFontFamilyMenu(editor, backstage);
  createStylesMenu(editor, backstage);
  createBlocksMenu(editor, backstage);
  createFontSizeMenu(editor, backstage);
};

export {
  register
};
