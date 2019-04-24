/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import Commands from './api/Commands';
import Buttons from './ui/Buttons';
import { Cell } from '@ephox/katamari';
import Dialog from './ui/Dialog';

PluginManager.add('help', function (editor) {
  const extraTabs = Cell([]);
  const dialogOpener = Dialog.init(editor, extraTabs);
  Buttons.register(editor, dialogOpener);
  Commands.register(editor, dialogOpener);
  editor.shortcuts.add('Alt+0', 'Open help dialog', 'mceHelp');
  return Api.get(extraTabs);
});

export default function () {}