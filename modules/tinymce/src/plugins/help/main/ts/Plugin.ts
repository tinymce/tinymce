import { Cell } from '@ephox/katamari';

import PluginManager from 'tinymce/core/api/PluginManager';
import { Dialog as DialogType } from 'tinymce/core/api/ui/Ui';

import * as Api from './api/Api';
import * as Commands from './api/Commands';
import * as Options from './api/Options';
import * as Buttons from './ui/Buttons';
import * as Dialog from './ui/Dialog';
import * as KeyboardNavTabI18n from './ui/KeyboardNavTabI18n';

export type TabSpecs = Record<string, DialogType.TabSpec>;
export type CustomTabSpecs = Cell<TabSpecs>;

export default (): void => {
  PluginManager.add('help', (editor, pluginUrl) => {
    const customTabs: CustomTabSpecs = Cell({});
    const api = Api.get(customTabs);

    Options.register(editor);
    const dialogOpener = Dialog.init(editor, customTabs, pluginUrl);
    Buttons.register(editor, dialogOpener);
    Commands.register(editor, dialogOpener);
    editor.shortcuts.add('Alt+0', 'Open help dialog', 'mceHelp');
    KeyboardNavTabI18n.initI18nLoad(editor, pluginUrl);

    return api;
  });
};
