/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import ThemeManager from 'tinymce/core/api/ThemeManager';
import ThemeApi from './api/ThemeApi';
import Buttons from './ui/Buttons';
import * as Panel from './ui/Panel';
import Api from 'tinymce/ui/Api';
import FormatControls from 'tinymce/ui/FormatControls';

declare let window: any;

Api.registerToFactory();
Api.appendTo(window.tinymce ? window.tinymce : {});

ThemeManager.add('inlite', function (editor) {
  const panel = Panel.create();

  FormatControls.setup(editor);
  Buttons.addToEditor(editor, panel);

  return ThemeApi.get(editor, panel);
});

export default function () { }