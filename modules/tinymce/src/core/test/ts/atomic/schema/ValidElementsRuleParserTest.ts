import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { assert } from 'chai';

import { SchemaElement } from 'tinymce/core/schema/SchemaTypes';
import * as ValidElementsRuleParser from 'tinymce/core/schema/ValidElementsRuleParser';

describe('atomic.tinymce.core.schema.ValidElementsRuleParserTest', () => {
  const testValidElementsParser = (testCase: { input: string; globalRule?: SchemaElement; expected: ValidElementsRuleParser.SchemaElementPair[] }) => {
    const elements = ValidElementsRuleParser.parseValidElementsRules(Optional.from(testCase.globalRule), testCase.input);
    assert.deepEqual(elements, testCase.expected);
  };

  context('Empty rules', () => {
    it('Parse empty string', () => testValidElementsParser({ input: '', expected: [ ] }));
    it('Parse whitespace string', () => testValidElementsParser({ input: '   ', expected: [ ] }));
  });

  context('Element names', () => {
    it('Simple element', () => testValidElementsParser({
      input: 'span',
      expected: [
        {
          name: 'span',
          element: {
            attributes: {},
            attributesOrder: []
          }
        }
      ]
    }));

    it('Wildcard element', () => testValidElementsParser({
      input: '*fo',
      expected: [
        {
          name: '*fo',
          element: {
            attributes: {},
            attributesOrder: []
          }
        }
      ]
    }));

    it('Global element', () => testValidElementsParser({
      input: '@',
      expected: [
        {
          name: '@',
          element: {
            attributes: {},
            attributesOrder: []
          }
        }
      ]
    }));

    it('Pad when empty', () => testValidElementsParser({
      input: '#span',
      expected: [
        {
          name: 'span',
          element: {
            attributes: {},
            attributesOrder: [],
            paddEmpty: true
          },
        }
      ]
    }));

    it('Remove when empty', () => testValidElementsParser({
      input: '-span',
      expected: [
        {
          name: 'span',
          element: {
            attributes: {},
            attributesOrder: [],
            removeEmpty: true
          }
        }
      ]
    }));

    it('Output name', () => testValidElementsParser({
      input: 'strong/b',
      expected: [
        {
          name: 'strong',
          element: {
            attributes: {},
            attributesOrder: [],
            outputName: 'strong'
          },
          aliasName: 'b'
        }
      ]
    }));
  });

  context('Attributes', () => {
    it('Single element with single a attribute', () => testValidElementsParser({
      input: 'a[href]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { href: {}},
            attributesOrder: [ 'href' ]
          }
        }
      ]
    }));

    it('Single element with single multiple attributes', () => testValidElementsParser({
      input: 'a[href|class|id]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { href: {}, class: {}, id: {}},
            attributesOrder: [ 'href', 'class', 'id' ]
          }
        }
      ]
    }));

    it('Remove when attributes are empty', () => testValidElementsParser({
      input: 'a![href]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { href: {}},
            attributesOrder: [ 'href' ],
            removeEmptyAttrs: true
          }
        }
      ]
    }));

    it('Default attribute value', () => testValidElementsParser({
      input: 'a[href=foo]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { href: { defaultValue: 'foo' }},
            attributesOrder: [ 'href' ],
            attributesDefault: [{ name: 'href', value: 'foo' }]
          }
        }
      ]
    }));

    it('Forced attribute value', () => testValidElementsParser({
      input: 'a[href~foo]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { href: { forcedValue: 'foo' }},
            attributesOrder: [ 'href' ],
            attributesForced: [{ name: 'href', value: 'foo' }]
          }
        }
      ]
    }));

    it('Valid attribute values', () => testValidElementsParser({
      input: 'a[href<foo?bar?baz]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { href: { validValues: { foo: {}, bar: {}, baz: {}}}},
            attributesOrder: [ 'href' ]
          }
        }
      ]
    }));

    it('Required attribute', () => testValidElementsParser({
      input: 'a[!href]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { href: { required: true }},
            attributesOrder: [ 'href' ],
            attributesRequired: [ 'href' ]
          }
        }
      ]
    }));

    it('Unescape escaped xml prefixes', () => testValidElementsParser({
      input: 'a[prefix\\:href]',
      expected: [
        {
          name: 'a',
          element: {
            attributes: { 'prefix:href': {}},
            attributesOrder: [ 'prefix:href' ]
          }
        }
      ]
    }));
  });

  context('Inherited global attributes', () => {
    it('Single element with inherited global attributes from existing global', () => testValidElementsParser({
      input: 'a[href]',
      globalRule: {
        attributes: { id: {}},
        attributesOrder: [ 'id' ]
      },
      expected: [
        {
          name: 'a',
          element: {
            attributes: { id: {}, href: {}},
            attributesOrder: [ 'id', 'href' ]
          }
        }
      ]
    }));

    it('Element with inherited global attributes from global rule', () => testValidElementsParser({
      input: '@[id],a[href]',
      expected: [
        {
          name: '@',
          element: {
            attributes: { id: {}},
            attributesOrder: [ 'id' ]
          }
        },
        {
          name: 'a',
          element: {
            attributes: { id: {}, href: {}},
            attributesOrder: [ 'id', 'href' ]
          }
        }
      ]
    }));

    it('Element with inherited global attributes from global element should ignore any parsed globals', () => testValidElementsParser({
      input: '@[foo],a[href]',
      globalRule: {
        attributes: { id: {}},
        attributesOrder: [ 'id' ]
      },
      expected: [
        {
          name: 'a',
          element: {
            attributes: { id: {}, href: {}},
            attributesOrder: [ 'id', 'href' ]
          }
        }
      ]
    }));

    it('Element with inherited global attributes from global rule ignoring the second one', () => testValidElementsParser({
      input: '@[id],@[foo],a[href]',
      expected: [
        {
          name: '@',
          element: {
            attributes: { id: {}},
            attributesOrder: [ 'id' ]
          }
        },
        {
          name: 'a',
          element: {
            attributes: { id: {}, href: {}},
            attributesOrder: [ 'id', 'href' ]
          }
        }
      ]
    }));

    it('Element that denies inherited global attribute from global rule', () => testValidElementsParser({
      input: '@[id],a[-id|href]',
      expected: [
        {
          name: '@',
          element: {
            attributes: { id: {}},
            attributesOrder: [ 'id' ]
          }
        },
        {
          name: 'a',
          element: {
            attributes: { href: {}},
            attributesOrder: [ 'href' ]
          }
        }
      ]
    }));
  });

  context('Multiple elements', () => {
    it('Multiple elements with multiple attributes', () => testValidElementsParser({
      input: 'span[id|class],a[href|class]',
      expected: [
        {
          name: 'span',
          element: {
            attributes: { id: {}, class: {}},
            attributesOrder: [ 'id', 'class' ]
          }
        },
        {
          name: 'a',
          element: {
            attributes: { href: {}, class: {}},
            attributesOrder: [ 'href', 'class' ]
          }
        }
      ]
    }));
  });
});

