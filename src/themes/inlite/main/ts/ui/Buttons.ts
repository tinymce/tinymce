/**
 * Buttons.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Panel from './Panel';
import Conversions from '../file/Conversions';
import Picker from '../file/Picker';
import Actions from '../core/Actions';

var addHeaderButtons = function (editor) {
  var formatBlock = function (name) {
    return function () {
      Actions.formatBlock(editor, name);
    };
  };

  for (var i = 1; i < 6; i++) {
    var name = 'h' + i;

    editor.addButton(name, {
      text: name.toUpperCase(),
      tooltip: 'Heading ' + i,
      stateSelector: name,
      onclick: formatBlock(name),
      onPostRender: function () {
        // TODO: Remove this hack that produces bold H1-H6 when we have proper icons
        var span = this.getEl().firstChild.firstChild;
        span.style.fontWeight = 'bold';
      }
    });
  }
};

var addToEditor = function (editor, panel) {
  editor.addButton('quicklink', {
    icon: 'link',
    tooltip: 'Insert/Edit link',
    stateSelector: 'a[href]',
    onclick: function () {
      panel.showForm(editor, 'quicklink');
    }
  });

  editor.addButton('quickimage', {
    icon: 'image',
    tooltip: 'Insert image',
    onclick: function () {
      Picker.pickFile().then(function (files) {
        var blob = files[0];

        Conversions.blobToBase64(blob).then(function (base64) {
          Actions.insertBlob(editor, base64, blob);
        });
      });
    }
  });

  editor.addButton('quicktable', {
    icon: 'table',
    tooltip: 'Insert table',
    onclick: function () {
      panel.hide();
      Actions.insertTable(editor, 2, 2);
    }
  });

  addHeaderButtons(editor);
};

export default <any> {
  addToEditor: addToEditor
};