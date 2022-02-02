/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Optional } from '@ephox/katamari';

import Editor from 'tinymce/core/api/Editor';
import { Dialog } from 'tinymce/core/api/ui/Ui';

export type HelpTabsSetting = (string | Dialog.TabSpec)[];

const getHelpTabs = (editor: Editor): Optional<HelpTabsSetting> =>
  Optional.from(editor.getParam('help_tabs'));

const getForcedPlugins = (editor: Editor): string[] | string | undefined =>
  editor.getParam('forced_plugins');

export {
  getHelpTabs,
  getForcedPlugins
};
