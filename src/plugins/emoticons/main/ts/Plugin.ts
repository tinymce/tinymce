/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
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

PluginManager.add('emoticons', function (editor, pluginUrl) {
  const databaseUrl = Settings.getEmoticonDatabaseUrl(editor, pluginUrl);

  const database = initDatabase(editor, databaseUrl);

  Buttons.register(editor, database);
  Autocompletion.init(editor, database);
});

export default function () { }