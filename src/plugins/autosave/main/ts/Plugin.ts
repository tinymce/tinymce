/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import * as Api from './api/Api';
import * as BeforeUnload from './core/BeforeUnload';
import * as Buttons from './ui/Buttons';
import * as Storage from './core/Storage';
import { Editor } from 'tinymce/core/api/Editor';
import * as Settings from './api/Settings';

/**
 * This class contains all core logic for the autosave plugin.
 *
 * @class tinymce.autosave.Plugin
 * @private
 */

PluginManager.add('autosave', function (editor: Editor) {
  const started = Cell(false);

  BeforeUnload.setup(editor);
  Buttons.register(editor, started);

  editor.on('init', function () {
    if (Settings.shouldRestoreWhenEmpty(editor) && editor.dom.isEmpty(editor.getBody())) {
      Storage.restoreDraft(editor);
    }
  });

  return Api.get(editor);
});

export default function () { }