import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { AstNode } from 'tinymce/core/api/PublicApi';
import { traverse } from 'tinymce/core/html/FilterNode';

describe('browser.tinymce.core.html.FilterNode', () => {
  it('TINY-6945: new traverse should work like old recursive traverse', () => {
    const results: string[] = [];

    const body = new AstNode('body', 11);

    const Child1 = new AstNode('Child1', 1);
    body.append(Child1);
    const Child1Sibling = new AstNode('Child1Sibling', 1);
    body.append(Child1Sibling);

    const Child2 = new AstNode('Child2', 1);
    Child1.append(Child2);

    const Child3 = new AstNode('Child3', 1);
    Child2.append(Child3);
    const Child3Sibling = new AstNode('Child3Sibling', 1);
    Child2.append(Child3Sibling);

    const expected = [
      'Child1',
      'Child2',
      'Child3',
      'Child3Sibling',
      'Child1Sibling'
    ];

    // TEST STRUCTURE:
    // body
    // |
    // Child1 --- Child1Sibling
    // |
    // Child2
    // |
    // Child3 --- Child3Sibling

    traverse(body, (node) => results.push(node.name));

    assert.deepEqual(results, expected, 'old result should be identical to new one');
  });
});
