/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Option } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';
import { HelpTabSpec } from '../ui/Dialog';

export type HelpTabsSetting = (string | HelpTabSpec)[];

const getHelpTabs = (editor: Editor): Option<HelpTabsSetting> => {
  return Option.from(editor.getParam('help_tabs'));
};

export {
  getHelpTabs
};