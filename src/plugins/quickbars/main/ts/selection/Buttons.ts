/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Editor } from 'tinymce/core/api/Editor';

const setupButtons = (editor: Editor) => {
  // TODO: Rewrite with silver
  // editor.addButton('quicklink', {
  //   icon: 'link',
  //   tooltip: 'Insert/Edit link',
  //   stateSelector: 'a[href]',
  //   onclick () {
  //     panel.showForm(editor, 'quicklink');
  //   }
  // });
};

export default {
  setupButtons
};
