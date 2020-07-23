/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import { Optional } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

export type HelpTabsSetting = (string | Types.Dialog.TabApi)[];

const getHelpTabs = (editor: Editor): Optional<HelpTabsSetting> => Optional.from(editor.getParam('help_tabs'));

const getForcedPlugins = (editor: Editor) => editor.getParam('forced_plugins');

export {
  getHelpTabs,
  getForcedPlugins
};
