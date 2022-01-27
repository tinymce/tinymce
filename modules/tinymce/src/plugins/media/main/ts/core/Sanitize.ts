/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Editor from 'tinymce/core/api/Editor';
import DomParser from 'tinymce/core/api/html/DomParser';
import AstNode from 'tinymce/core/api/html/Node';

import * as Options from '../api/Options';

const parseAndSanitize = (editor: Editor, context: string, html: string): AstNode => {
  const validate = Options.shouldFilterHtml(editor);
  const parser = DomParser({ validate, forced_root_block: false }, editor.schema);
  return parser.parse(html, { context });
};

export {
  parseAndSanitize
};
