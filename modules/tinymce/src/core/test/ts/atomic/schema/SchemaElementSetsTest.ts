import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as SchemaElementSets from 'tinymce/core/schema/SchemaElementSets';
import { SchemaType } from 'tinymce/core/schema/SchemaTypes';

describe('atomic.tinymce.core.schema.SchemaElementSetsTest', () => {
  const testSchemaElementSets = (testCase: { type: SchemaType; expected: SchemaElementSets.ElementSets<string[]> }) => {
    const { globalAttributes, blockContent, phrasingContent, flowContent } = SchemaElementSets.getElementSetsAsStrings(testCase.type);

    assert.deepEqual({
      globalAttributes: globalAttributes.split(' '),
      blockContent: blockContent.split(' '),
      phrasingContent: phrasingContent.split(' '),
      flowContent: flowContent.split(' '),
    }, testCase.expected);
  };

  it('HTML5 element sets', () => testSchemaElementSets({
    type: 'html5',
    expected: {
      globalAttributes: [
        'id', 'accesskey', 'class', 'dir', 'lang', 'style', 'tabindex', 'title', 'role', 'contenteditable', 'contextmenu',
        'draggable', 'dropzone', 'hidden', 'spellcheck', 'translate', 'xml:lang'
      ],
      blockContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map', 'center', 'dir', 'isindex', 'noframes'
      ],
      phrasingContent: [
        'a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
        'input', 'ins', 'kbd', 'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small',
        'span', 'strong', 'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'audio', 'canvas', 'command',
        'datalist', 'mark', 'meter', 'output', 'picture', 'progress', 'time', 'wbr', 'video', 'ruby', 'bdi', 'keygen',
        'svg', 'acronym', 'applet', 'basefont', 'big', 'font', 'strike', 'tt'
      ],
      flowContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map', 'center', 'dir', 'isindex', 'noframes', 'a',
        'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input',
        'ins', 'kbd', 'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strong',
        'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'audio', 'canvas', 'command', 'datalist', 'mark',
        'meter', 'output', 'picture', 'progress', 'time', 'wbr', 'video', 'ruby', 'bdi', 'keygen', 'svg', 'acronym', 'applet',
        'basefont', 'big', 'font', 'strike', 'tt'
      ]
    }
  }));

  it('HTML5-strict element sets', () => testSchemaElementSets({
    type: 'html5-strict',
    expected: {
      globalAttributes: [
        'id', 'accesskey', 'class', 'dir', 'lang', 'style', 'tabindex', 'title', 'role', 'contenteditable', 'contextmenu',
        'draggable', 'dropzone', 'hidden', 'spellcheck', 'translate'
      ],
      blockContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map'
      ],
      phrasingContent: [
        'a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
        'input', 'ins', 'kbd', 'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small',
        'span', 'strong', 'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'audio', 'canvas', 'command',
        'datalist', 'mark', 'meter', 'output', 'picture', 'progress', 'time', 'wbr', 'video', 'ruby', 'bdi', 'keygen', 'svg'
      ],
      flowContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map', 'a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite',
        'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'noscript',
        'object', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'u',
        'var', '#text', '#comment', 'audio', 'canvas', 'command', 'datalist', 'mark', 'meter', 'output', 'picture',
        'progress', 'time', 'wbr', 'video', 'ruby', 'bdi', 'keygen', 'svg'
      ]
    }
  }));

  it('HTML4 element sets', () => testSchemaElementSets({
    type: 'html4',
    expected: {
      globalAttributes: [
        'id', 'accesskey', 'class', 'dir', 'lang', 'style', 'tabindex', 'title', 'role', 'xml:lang'
      ],
      blockContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'center', 'dir', 'isindex', 'noframes'
      ],
      phrasingContent: [
        'a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
        'input', 'ins', 'kbd', 'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small',
        'span', 'strong', 'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'acronym', 'applet', 'basefont',
        'big', 'font', 'strike', 'tt'
      ],
      flowContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'center', 'dir', 'isindex', 'noframes', 'a', 'abbr', 'b', 'bdo', 'br',
        'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
        'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strong',
        'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'acronym', 'applet', 'basefont', 'big',
        'font', 'strike', 'tt'
      ]
    }
  }));
});

