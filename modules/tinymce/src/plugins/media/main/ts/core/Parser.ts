import DomParser, { type DomParserSettings } from 'tinymce/core/api/html/DomParser';
import type Schema from 'tinymce/core/api/html/Schema';

export const Parser = (schema?: Schema, settings: DomParserSettings = {}): DomParser => DomParser({
  forced_root_block: false,
  validate: false,
  allow_conditional_comments: true,
  ...settings
}, schema);
