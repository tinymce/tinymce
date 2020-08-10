/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';

const allowHtmlInNamedAnchor = (editor: Editor) => editor.getParam('allow_html_in_named_anchor', false, 'boolean');

export {
  allowHtmlInNamedAnchor
};
