/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import Buttons from './ui/Buttons';

/**
 * This class contains all core logic for the emoticons plugin.
 *
 * @class tinymce.emoticons.Plugin
 * @private
 */

PluginManager.add('emoticons', function (editor, pluginUrl) {
  Buttons.register(editor, pluginUrl);
});

export default function () { }