/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Commands from './api/Commands';
import * as Settings from './api/Settings';
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
    const databaseUrl = Settings.getEmoticonDatabaseUrl(editor, pluginUrl);
    const databaseId = Settings.getEmoticonDatabaseId(editor);

    const database = initDatabase(editor, databaseUrl, databaseId);

    Commands.register(editor, database);
    Buttons.register(editor);
    Autocompletion.init(editor, database);
    Filters.setup(editor);
  });
};
