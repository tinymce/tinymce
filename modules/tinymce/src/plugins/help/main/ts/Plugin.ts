/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';
import { Dialog as DialogType } from 'tinymce/core/api/ui/Ui';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Buttons from './ui/Buttons';
import * as Dialog from './ui/Dialog';

export type TabSpecs = Record<string, DialogType.TabSpec>;
export type CustomTabSpecs = Cell<TabSpecs>;

export default (): void => {
  PluginManager.add('help', (editor) => {
    const customTabs: CustomTabSpecs = Cell({});
    const api = Api.get(customTabs);

    const dialogOpener = Dialog.init(editor, customTabs);
    Buttons.register(editor, dialogOpener);
    Commands.register(editor, dialogOpener);
    editor.shortcuts.add('Alt+0', 'Open help dialog', 'mceHelp');

    return api;
  });
};
