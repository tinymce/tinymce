/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { alignMenu } from './complex/AlignBespoke';
import { blocksMenu } from './complex/BlocksBespoke';
import { fontFamilyMenu } from './complex/FontFamilyBespoke';
import { fontSizeMenu } from './complex/FontSizeBespoke';
import { stylesMenu } from './complex/StylesBespoke';

const register = (editor: Editor, backstage: UiFactoryBackstage) => {
  alignMenu(editor, backstage);
  fontFamilyMenu(editor, backstage);
  stylesMenu(editor, backstage);
  blocksMenu(editor, backstage);
  fontSizeMenu(editor, backstage);
};

export {
  register
};
