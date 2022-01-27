/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { createAlignMenu } from './complex/AlignBespoke';
import { createBlocksMenu } from './complex/BlocksBespoke';
import { createFontFamilyMenu } from './complex/FontFamilyBespoke';
import { createFontSizeMenu } from './complex/FontSizeBespoke';
import { createStylesMenu } from './complex/StylesBespoke';

const register = (editor: Editor, backstage: UiFactoryBackstage) => {
  createAlignMenu(editor, backstage);
  createFontFamilyMenu(editor, backstage);
  createStylesMenu(editor, backstage);
  createBlocksMenu(editor, backstage);
  createFontSizeMenu(editor, backstage);
};

export {
  register
};
