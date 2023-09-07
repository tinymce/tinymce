import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as SchemaLookupTable from 'tinymce/core/schema/SchemaLookupTable';
import { SchemaType } from 'tinymce/core/schema/SchemaTypes';

describe('atomic.tinymce.core.schema.SchemaLookupTableTest', () => {
  const testSchemaInputElementAttributes = (type: SchemaType, expected: string[]) => {
    const schema = SchemaLookupTable.makeSchema(type);

    assert.deepEqual(schema.input.attributesOrder, expected);
  };

  it('HTML5 lookup table', () => testSchemaInputElementAttributes('html5', [
    'id', 'accesskey', 'class', 'dir', 'lang', 'style', 'tabindex', 'title', 'role', 'contenteditable', 'contextmenu',
    'draggable', 'dropzone', 'hidden', 'spellcheck', 'translate', 'xml:lang', 'accept', 'alt', 'autocomplete',
    'checked', 'dirname', 'disabled', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate',
    'formtarget', 'height', 'list', 'max', 'maxlength', 'min', 'multiple', 'name', 'pattern', 'readonly',
    'required', 'size', 'src', 'step', 'type', 'value', 'width', 'usemap', 'align', 'autofocus', 'placeholder'
  ]));

  it('HTML5-strict lookup table', () => testSchemaInputElementAttributes('html5-strict', [
    'id', 'accesskey', 'class', 'dir', 'lang', 'style', 'tabindex', 'title', 'role', 'contenteditable', 'contextmenu',
    'draggable', 'dropzone', 'hidden', 'spellcheck', 'translate', 'accept', 'alt', 'autocomplete', 'checked',
    'dirname', 'disabled', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget',
    'height', 'list', 'max', 'maxlength', 'min', 'multiple', 'name', 'pattern', 'readonly', 'required',
    'size', 'src', 'step', 'type', 'value', 'width', 'autofocus', 'placeholder'
  ]));

  it('HTML4 lookup table', () => testSchemaInputElementAttributes('html4', [
    'id', 'accesskey', 'class', 'dir', 'lang', 'style', 'tabindex', 'title', 'role', 'xml:lang', 'accept', 'alt',
    'autocomplete', 'checked', 'dirname', 'disabled', 'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate',
    'formtarget', 'height', 'list', 'max', 'maxlength', 'min', 'multiple', 'name', 'pattern', 'readonly', 'required',
    'size', 'src', 'step', 'type', 'value', 'width', 'usemap', 'align'
  ]));
});

