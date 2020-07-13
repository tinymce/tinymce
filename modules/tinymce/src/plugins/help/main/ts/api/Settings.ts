/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Types } from '@ephox/bridge';
import Editor from 'tinymce/core/api/Editor';

export type HelpTabsSetting = (string | Types.Dialog.TabApi)[];

const getSetting = <T>(name: string, defaultValue?: T, type?: string) => (editor: Editor): T =>
  editor.getParam(name, defaultValue, type);

const getHelpTabs = getSetting<HelpTabsSetting>('help_tabs');

const getForcedPlugins = getSetting<string[]>('forced_plugins');

export {
  getHelpTabs,
  getForcedPlugins
};
