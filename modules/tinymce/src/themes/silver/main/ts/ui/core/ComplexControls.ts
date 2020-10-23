/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage } from '../../backstage/Backstage';
import { alignSelectMenu } from './complex/AlignSelect';
import { fontSelectMenu } from './complex/FontSelect';
import { fontsizeSelectMenu } from './complex/FontsizeSelect';
import { formatSelectMenu } from './complex/FormatSelect';
import { styleSelectMenu } from './complex/StyleSelect';

const register = (editor: Editor, backstage: UiFactoryBackstage) => {
  alignSelectMenu(editor, backstage);
  fontSelectMenu(editor, backstage);
  styleSelectMenu(editor, backstage);
  formatSelectMenu(editor, backstage);
  fontsizeSelectMenu(editor, backstage);
};

export {
  register
};
