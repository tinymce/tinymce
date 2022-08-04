import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { AstNode } from 'tinymce/core/api/PublicApi';
import { traverse } from 'tinymce/core/html/FilterNode';

describe('browser.tinymce.core.html.FilterNode', () => {
  it('TINY-6945: new traverse should work like old recursive traverse', () => {
    const results: string[] = [];

    const body = new AstNode('body', 11);
    const testRootFather = new AstNode('testRootFather', 1);
    body.append(testRootFather);
    const testRootFatherSibling = new AstNode('testRootFatherSibling', 1);
    body.append(testRootFatherSibling);

    const testRoot = new AstNode('testRoot', 1);
    testRootFather.append(testRoot);
    const testRootSibling = new AstNode('testRootSibling', 1);
    testRootFather.append(testRootSibling);

    const testRootChild1 = new AstNode('testRootChild1', 1);
    testRoot.append(testRootChild1);
    const testRootChild1Sibling = new AstNode('testRootChild1Sibling', 1);
    testRoot.append(testRootChild1Sibling);

    const testRootChild2 = new AstNode('testRootChild2', 1);
    testRootChild1.append(testRootChild2);

    const testRootChild3 = new AstNode('testRootChild3', 1);
    testRootChild2.append(testRootChild3);
    const testRootChild3Sibling = new AstNode('testRootChild3Sibling', 1);
    testRootChild2.append(testRootChild3Sibling);

    const expected = [
      'testRootChild1',
      'testRootChild2',
      'testRootChild3',
      'testRootChild3Sibling',
      'testRootChild1Sibling'
    ];

    // TEST STRUCTURE:
    // body
    // |
    // testRootFather --- testRootFatherSibling
    // |
    // testRoot --- testRootSibling
    // |
    // testRootChild1 --- testRootChild1Sibling
    // |
    // testRootChild2
    // |
    // testRootChild3 --- testRootChild3Sibling

    traverse(testRoot, (node) => results.push(node.name));

    assert.deepEqual(results, expected, 'old result should be identical to new one');
  });
});
