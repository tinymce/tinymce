/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Conversions from '../file/Conversions';
import Picker from '../file/Picker';
import Actions from '../core/Actions';
import { Editor } from 'tinymce/core/api/Editor';
import { InlitePanel } from 'tinymce/themes/inlite/ui/Panel';

const addHeaderButtons = function (editor: Editor) {
  const formatBlock = function (name: string) {
    return function () {
      Actions.formatBlock(editor, name);
    };
  };

  for (let i = 1; i < 6; i++) {
    const name = 'h' + i;

    editor.addButton(name, {
      text: name.toUpperCase(),
      tooltip: 'Heading ' + i,
      stateSelector: name,
      onclick: formatBlock(name),
      onPostRender () {
        // TODO: Remove this hack that produces bold H1-H6 when we have proper icons
        const span = this.getEl().firstChild.firstChild;
        span.style.fontWeight = 'bold';
      }
    });
  }
};

const addToEditor = function (editor: Editor, panel: InlitePanel) {
  editor.addButton('quicklink', {
    icon: 'link',
    tooltip: 'Insert/Edit link',
    stateSelector: 'a[href]',
    onclick () {
      panel.showForm(editor, 'quicklink');
    }
  });

  editor.addButton('quickimage', {
    icon: 'image',
    tooltip: 'Insert image',
    onclick () {
      Picker.pickFile().then(function (files) {
        const blob = files[0];

        Conversions.blobToBase64(blob).then(function (base64) {
          Actions.insertBlob(editor, base64, blob);
        });
      });
    }
  });

  editor.addButton('quicktable', {
    icon: 'table',
    tooltip: 'Insert table',
    onclick () {
      panel.hide();
      Actions.insertTable(editor, 2, 2);
    }
  });

  addHeaderButtons(editor);
};

export default {
  addToEditor
};