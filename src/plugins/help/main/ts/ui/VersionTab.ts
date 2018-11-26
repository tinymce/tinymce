/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import EditorManager from 'tinymce/core/api/EditorManager';
import I18n from 'tinymce/core/api/util/I18n';

const tab = () => {
  const getVersion = (major: string, minor: string) => {
    return major.indexOf('@') === 0 ? 'X.X.X' : major + '.' + minor;
  };
  const version = getVersion(EditorManager.majorVersion, EditorManager.minorVersion);
  const changeLogLink = '<a href="https://www.tinymce.com/docs/changelog/?utm_campaign=editor_referral&utm_medium=help_dialog&utm_source=tinymce" target="_blank">TinyMCE ' + version + '</a>';

  return {
    title: 'Version',
    items: [
      {
        type: 'htmlpanel',
        html: I18n.translate(['You are using {0}', changeLogLink])
      }
    ]
  };
};

export default {
  tab
};