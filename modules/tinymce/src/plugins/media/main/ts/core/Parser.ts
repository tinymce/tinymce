import DomParser, { DomParserSettings } from 'tinymce/core/api/html/DomParser';
import Schema from 'tinymce/core/api/html/Schema';

export const Parser = (schema?: Schema, settings: DomParserSettings = {}): DomParser => DomParser({
  validate: false,
  allow_conditional_comments: true,
  ...settings
}, schema);
