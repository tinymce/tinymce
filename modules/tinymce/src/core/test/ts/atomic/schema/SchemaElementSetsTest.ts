import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as SchemaElementSets from 'tinymce/core/schema/SchemaElementSets';
import * as SchemaTypes from 'tinymce/core/schema/SchemaTypes';

describe('atomic.tinymce.core.schema.SchemaElementSetsTest', () => {
  const assertDirectMutation = (names: readonly string[]) => {
    assert.throw(() => {
      const mutableNames = names as string[];

      // Should not be mutable
      mutableNames.push('foo');
    });
  };

  const testSchemaElementSets = (testCase: { type: SchemaTypes.SchemaType; expected: SchemaElementSets.ElementSets<string[]> }) => {
    const stringSets = SchemaElementSets.getElementSetsAsStrings(testCase.type);
    const arraySets = SchemaElementSets.getElementSets(testCase.type);

    assert.deepEqual({
      blockContent: stringSets.blockContent.split(' '),
      phrasingContent: stringSets.phrasingContent.split(' '),
      flowContent: stringSets.flowContent.split(' ')
    }, testCase.expected);

    assert.deepEqual({
      blockContent: arraySets.blockContent,
      phrasingContent: arraySets.phrasingContent,
      flowContent: arraySets.flowContent
    }, testCase.expected);

    assertDirectMutation(arraySets.blockContent);
    assertDirectMutation(arraySets.phrasingContent);
    assertDirectMutation(arraySets.flowContent);

    // Should not be possible to replace things
    assert.throw(() => {
      arraySets.flowContent = [];
    });
  };

  it('HTML5 element sets', () => testSchemaElementSets({
    type: 'html5',
    expected: {
      blockContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map', 'center', 'dir', 'isindex', 'noframes'
      ],
      phrasingContent: [
        'a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
        'input', 'ins', 'kbd', 'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small',
        'span', 'strong', 'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'audio', 'canvas', 'command',
        'data', 'datalist', 'mark', 'meter', 'output', 'picture', 'progress', 'time', 'wbr', 'video',
        'ruby', 'bdi', 'keygen', 'svg', 'acronym', 'applet', 'basefont', 'big', 'font', 'strike', 'tt'
      ],
      flowContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map', 'center', 'dir', 'isindex', 'noframes', 'a',
        'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input',
        'ins', 'kbd', 'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strong',
        'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'audio', 'canvas', 'command', 'data', 'datalist', 'mark',
        'meter', 'output', 'picture', 'progress', 'time', 'wbr', 'video', 'ruby', 'bdi', 'keygen', 'svg', 'acronym',
        'applet', 'basefont', 'big', 'font', 'strike', 'tt'
      ]
    }
  }));

  it('HTML5-strict element sets', () => testSchemaElementSets({
    type: 'html5-strict',
    expected: {
      blockContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map'
      ],
      phrasingContent: [
        'a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite', 'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
        'input', 'ins', 'kbd', 'label', 'map', 'noscript', 'object', 'q', 's', 'samp', 'script', 'select', 'small',
        'span', 'strong', 'sub', 'sup', 'textarea', 'u', 'var', '#text', '#comment', 'audio', 'canvas', 'command',
        'data', 'datalist', 'mark', 'meter', 'output', 'picture', 'progress', 'time', 'wbr', 'video',
        'ruby', 'bdi', 'keygen', 'svg'
      ],
      flowContent: [
        'address', 'blockquote', 'div', 'dl', 'fieldset', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'menu',
        'ol', 'p', 'pre', 'table', 'ul', 'article', 'aside', 'details', 'dialog', 'figure', 'main', 'header', 'footer',
        'hgroup', 'section', 'nav', 'a', 'ins', 'del', 'canvas', 'map', 'a', 'abbr', 'b', 'bdo', 'br', 'button', 'cite',
        'code', 'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'map', 'noscript',
        'object', 'q', 's', 'samp', 'script', 'select', 'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'u',
        'var', '#text', '#comment', 'audio', 'canvas', 'command', 'data', 'datalist', 'mark', 'meter', 'output', 'picture',
        'progress', 'time', 'wbr', 'video', 'ruby', 'bdi', 'keygen', 'svg'
      ]
    }
  }));

  it('HTML4 element sets', () => testSchemaElementSets({
    type: 'html4',
    expected: {
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

