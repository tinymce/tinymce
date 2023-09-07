import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as CustomElementsRuleParser from 'tinymce/core/schema/CustomElementsRuleParser';

describe('atomic.tinymce.core.schema.CustomElementsRuleParserTest', () => {
  const testCustomElementsRuleParser = (testCase: { input: string; expected: CustomElementsRuleParser.CustomElementRule[] }) => {
    const elements = CustomElementsRuleParser.parseCustomElementsRules(testCase.input);
    assert.deepEqual(elements, testCase.expected);
  };

  context('Empty rules', () => {
    it('Parse empty string', () => testCustomElementsRuleParser({ input: '', expected: [ ] }));
    it('Parse whitespace string', () => testCustomElementsRuleParser({ input: '   ', expected: [ ] }));
  });

  context('Inline and block rules', () => {
    it('Custom inline element', () => testCustomElementsRuleParser({
      input: '~foo',
      expected: [
        {
          inline: true,
          cloneName: 'span',
          name: 'foo'
        }
      ]
    }));

    it('Custom block element', () => testCustomElementsRuleParser({
      input: 'foo',
      expected: [
        {
          inline: false,
          cloneName: 'div',
          name: 'foo'
        }
      ]
    }));

    it('Parse whitespace string', () => testCustomElementsRuleParser({
      input: 'foo,~bar',
      expected: [
        {
          inline: false,
          cloneName: 'div',
          name: 'foo'
        },
        {
          inline: true,
          cloneName: 'span',
          name: 'bar'
        }
      ]
    }));
  });
});

