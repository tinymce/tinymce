/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr } from '@ephox/katamari';
import I18n from 'tinymce/core/api/util/I18n';
import KeyboardShortcuts from '../data/KeyboardShortcuts';

const makeTab = function () {
  const makeAriaLabel = function (shortcut) {
    return 'aria-label="Action: ' + shortcut.action + ', Shortcut: ' + shortcut.shortcut.replace(/Ctrl/g, 'Control') + '"';
  };
  const shortcutLisString = Arr.map(KeyboardShortcuts.shortcuts, function (shortcut) {
    return '<tr data-mce-tabstop="1" tabindex="-1" ' + makeAriaLabel(shortcut) + '>' +
              '<td>' + I18n.translate(shortcut.action) + '</td>' +
              '<td>' + shortcut.shortcut + '</td>' +
            '</tr>';
  }).join('');

  return {
    title: 'Handy Shortcuts',
    type: 'container',
    style: 'overflow-y: auto; overflow-x: hidden; max-height: 250px',
    items: [
      {
        type: 'container',
        html: '<div>' +
                '<table class="mce-table-striped">' +
                  '<thead>' +
                    '<th>' + I18n.translate('Action') + '</th>' +
                    '<th>' + I18n.translate('Shortcut') + '</th>' +
                  '</thead>' +
                  shortcutLisString +
                '</table>' +
              '</div>'
      }
    ]
  };
};

export default {
  makeTab
};