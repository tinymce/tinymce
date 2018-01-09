/**
 * ButtonsRow.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import EditorManager from 'tinymce/core/EditorManager';
import I18n from 'tinymce/core/util/I18n';

var getVersion = function (major, minor) {
  return major.indexOf('@') === 0 ? 'X.X.X' : major + '.' + minor;
};

var makeRow = function () {
  var version = getVersion(EditorManager.majorVersion, EditorManager.minorVersion);
  var changeLogLink = '<a href="https://www.tinymce.com/docs/changelog/?utm_campaign=editor_referral&utm_medium=help_dialog&utm_source=tinymce" target="_blank">TinyMCE ' + version + '</a>';

  return [
    {
      type: 'label',
      html: I18n.translate(['You are using {0}', changeLogLink])
    },
    {
      type: 'spacer',
      flex: 1
    },
    {
      text: 'Close',
      onclick: function () {
        this.parent().parent().close();
      }
    }
  ];
};

export default {
  makeRow: makeRow
};