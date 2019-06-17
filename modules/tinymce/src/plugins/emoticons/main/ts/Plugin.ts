/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Autocompletion from './ui/Autocompletion';
import Buttons from './ui/Buttons';
import { initDatabase } from './core/EmojiDatabase';
import Settings from './api/Settings';

/**
 * This class contains all core logic for the emoticons plugin.
 *
 * @class tinymce.emoticons.Plugin
 * @private
 */

export default function () {
  PluginManager.add('emoticons', function (editor, pluginUrl) {
    const databaseUrl = Settings.getEmoticonDatabaseUrl(editor, pluginUrl);

    const database = initDatabase(editor, databaseUrl);

    Buttons.register(editor, database);
    Autocompletion.init(editor, database);
  });
}
