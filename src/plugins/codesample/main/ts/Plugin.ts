/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import { Cell } from '@ephox/katamari';
import PluginManager from 'tinymce/core/api/PluginManager';
import Commands from './api/Commands';
import FilterContent from './core/FilterContent';
import LoadCss from './core/LoadCss';
import Buttons from './ui/Buttons';
import Dialog from './ui/Dialog';
import Utils from './util/Utils';

const addedInlineCss = Cell(false);

PluginManager.add('codesample', function (editor, pluginUrl) {
  const addedCss = Cell(false);

  FilterContent.setup(editor);
  Buttons.register(editor);
  Commands.register(editor);

  editor.on('init', function () {
    LoadCss.loadCss(editor, pluginUrl, addedInlineCss, addedCss);
  });

  editor.on('dblclick', function (ev) {
    if (Utils.isCodeSample(ev.target)) {
      Dialog.open(editor);
    }
  });
});

export default function () { }