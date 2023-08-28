import { context, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as ValidChildrenRuleParser from 'tinymce/core/schema/ValidChildrenRuleParser';

describe('atomic.tinymce.core.schema.ValidChildrenRuleParserTest', () => {
  const testValidChildrenRuleParser = (testCase: { input: string; expected: ValidChildrenRuleParser.ValidChildrenRule[] }) => {
    const elements = ValidChildrenRuleParser.parseValidChildrenRules(testCase.input);
    assert.deepEqual(elements, testCase.expected);
  };

  context('Empty rules', () => {
    it('Parse empty string', () => testValidChildrenRuleParser({ input: '', expected: [ ] }));
    it('Parse whitespace string', () => testValidChildrenRuleParser({ input: '   ', expected: [ ] }));
  });

  context('Inline and block rules', () => {
    it('Replace children', () => testValidChildrenRuleParser({
      input: 'foo[bar|baz]',
      expected: [
        {
          name: 'foo',
          operation: 'replace',
          validChildren: [ 'bar', 'baz' ]
        }
      ]
    }));

    it('Add children', () => testValidChildrenRuleParser({
      input: '+foo[bar|baz]',
      expected: [
        {
          name: 'foo',
          operation: 'add',
          validChildren: [ 'bar', 'baz' ]
        }
      ]
    }));

    it('Remove children', () => testValidChildrenRuleParser({
      input: '-foo[bar|baz]',
      expected: [
        {
          name: 'foo',
          operation: 'remove',
          validChildren: [ 'bar', 'baz' ]
        }
      ]
    }));
  });
});

