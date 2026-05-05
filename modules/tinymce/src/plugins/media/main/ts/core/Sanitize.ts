import type Editor from 'tinymce/core/api/Editor';
import type AstNode from 'tinymce/core/api/html/Node';

import * as Options from '../api/Options';

import { Parser } from './Parser';

const parseAndSanitize = (editor: Editor, html: string): AstNode => {
  const getEditorOption = editor.options.get;
  const sanitize = getEditorOption('xss_sanitization');
  const validate = Options.shouldFilterHtml(editor);
  return Parser(editor.schema, { sanitize, validate }).parse(html);
};

export {
  parseAndSanitize
};
