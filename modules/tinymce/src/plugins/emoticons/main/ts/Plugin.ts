import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Options from './api/Options';
import { initDatabase } from './core/EmojiDatabase';
import * as Filters from './core/Filters';
import * as Autocompletion from './ui/Autocompletion';
import * as Buttons from './ui/Buttons';

/**
 * This class contains all core logic for the emoticons plugin.
 *
 * @class tinymce.emoticons.Plugin
 * @private
 */

export default (): void => {
  PluginManager.add('emoticons', (editor, pluginUrl) => {
    Options.register(editor, pluginUrl);
    const databaseUrl = Options.getEmojiDatabaseUrl(editor);
    const databaseId = Options.getEmojiDatabaseId(editor);

    const database = initDatabase(editor, databaseUrl, databaseId);

    Commands.register(editor, database);
    Buttons.register(editor);
    Autocompletion.init(editor, database);
    Filters.setup(editor);
  });
};
