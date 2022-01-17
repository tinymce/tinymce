/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import PluginManager from 'tinymce/core/api/PluginManager';

import * as Api from './api/Api';
import * as Options from './api/Options';
import * as ImportCss from './core/ImportCss';

export default (): void => {
  PluginManager.add('importcss', (editor) => {
    Options.register(editor);
    ImportCss.setup(editor);
    return Api.get(editor);
  });
};
